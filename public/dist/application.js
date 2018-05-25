'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('dashboards');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('filters');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('orgcharts');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('reminders');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('reports');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('resources');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('serverchecks');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('shedulers');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('sources');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('virtualmobiles');

'use strict';

angular.module('core.admin',['angularMoment']).run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes',['angularMoment']).config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core',['angularMoment']).config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl:'modules/users/client/views/authentication/signin.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'moment', '$state', 'Authentication', 'Menus', 'Sources',
  function ($scope, moment, $state, Authentication, Menus, Sources) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;
    $scope.notification;
    var date = new Date();

    $scope.seenNotification = function () {


      var source_Manufacture_Update = new Sources({});
      source_Manufacture_Update.user = Authentication.user._id;
      source_Manufacture_Update.clientId = Authentication.user.lastName;
      // source_Manufacture_Update.index=index;
      source_Manufacture_Update.messageType = "sawNotification";
      // source_Manufacture_Update.id=object[0]._id;
      source_Manufacture_Update.$save(function (response) {
        console.log("inside Manufacture Delete\n\n\n");
        console.log(response);
        // console.log(response.Data[1])
        // $scope.contnofitication=0;
        console.log("this is responce");
        $scope.head();
        // for(var i=0;i<response.Data.length;i++){
        //   if(response.Data[i].notification_status===1){
        //     $scope.contnofitication++;
        //   }
        // }
        // console.log($scope.contnofitication)
        console.log(response);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    }
    $scope.minimalize = function () {
      angular.element('body').toggleClass('mini-navbar');
      // if (!angular.element('body').hasClass('mini-navbar') || angular.element('body').hasClass('body-small')) {
      // Hide menu in order to smoothly turn on when maximize menu
      angular.element('#side-menu').hide();
      // For smoothly turn on menu
      // $timeout(function () {
      //   angular.element('#side-menu').fadeIn(400);
      // }, 200);
      // } else {
      // Remove all inline style from jquery fadeIn function to reset menu state
      angular.element('#side-menu').removeAttr('style');
      // }
    };
    $scope.head = function () {
      // alert('inside head function');

      if (Authentication.user.__v != undefined) {
        var source_Manufacture_Update = new Sources({});
        source_Manufacture_Update.user = Authentication.user._id;
        source_Manufacture_Update.clientId = Authentication.user.lastName;
        // source_Manufacture_Update.index=index;
        source_Manufacture_Update.messageType = "seeNotification";
        // source_Manufacture_Update.id=object[0]._id;
        source_Manufacture_Update.$save(function (response) {
          console.log("inside Manufacture Delete\n\n\n");
          console.log(response);
          $scope.notification = response;
          console.log(response.Data.length);

          // console.log(response.Data[1])
          $scope.contnofitication = 0;
          console.log("this is responce");
          for (var i = 0; i < response.Data.length; i++) {
            if (response.Data[i].notification_status === 1) {
              $scope.contnofitication++;
            }
          }
          console.log($scope.contnofitication)
          // object=Sources.query();
          // init();
          // flag=1;
          // assetDataTable();
          // manufactureTable();\
          // var time=new Date($scope.notification.Data[5].updated_time);
          // alert(time);
          // alert(time.getTime()*60000);

          // alert(date);
          // $scope.ntftime=new Date(date.getTime()-time.getTime()*60000);
          // var time
          // alert($scope.ntftime)
          // $scope.clear();
          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }

    }
    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    // Some example string
    $scope.helloText = 'Welcome in INSPINIA MEAN.JS Boilerplate';
    $scope.descriptionText = 'It is an application skeleton for a typical MEAN web app. You can use it to quickly bootstrap your project.';

  }
]);

'use strict';

//Directive used to set metisMenu and minimalize button
angular.module('core')
  .directive('sideNavigation', ["$timeout", function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element) {
        // Call metsi to build when user signup
        scope.$watch('authentication.user', function () {
          $timeout(function () {
            element.metisMenu();
          });
        });

        // Colapse menu in mobile mode after click on element
        var menuElement = angular.element('#side-menu a:not([href$="\\#"])');
        menuElement.click(function () {
          if (angular.element(window).width() < 769) {
            angular.element("body").toggleClass("mini-navbar");
          }
        });
      }
    };
  }])
  .directive('minimalizaSidebar', ["$timeout", function ($timeout) {
    return {
      restrict: 'A',
      template: '<button class="navbar-minimalize minimalize-styl-2 btn dim btn-primary " ng-click="minimalize()"><i class="fa fa-bars"></i></button>',
      controller: ["$scope", "$element", function ($scope, $element) {
        $scope.minimalize = function () {
          angular.element('body').toggleClass('mini-navbar');
          if (!angular.element('body').hasClass('mini-navbar') || angular.element('body').hasClass('body-small')) {
            // Hide menu in order to smoothly turn on when maximize menu
            angular.element('#side-menu').hide();
            // For smoothly turn on menu
            $timeout(function () {
              angular.element('#side-menu').fadeIn(400);
            }, 200);
          } else {
            // Remove all inline style from jquery fadeIn function to reset menu state
            angular.element('#side-menu').removeAttr('style');
          }
        };
      }]
    };
  }]);

'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

// Configuring the dashboards module
angular.module('dashboards').run(['Menus',
  function (Menus) {
 /*   // Add the dashboards dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Dashboard',
      state: 'dashboards',
      type: 'dropdown',
      roles: ['*']
    });
      

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'dashboards', {
      title: 'List dashboards',
      state: 'dashboards.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'dashboards', {
      title: 'Create dashboards',
      state: 'dashboards.create',
      roles: ['user']
    });*/
      
     
  }
]);

'use strict';

// Setting up route
angular.module('dashboards').config(['$stateProvider',
  function ($stateProvider) {
    // Dashboards state routing
    $stateProvider
      .state('dashboards', {
        abstract: true,
        url: '/dashboards',
        template: '<ui-view/>'
      })
      .state('dashboards.list', {
        url: '',
        templateUrl: 'modules/dashboards/client/views/list-dashboards.client.view.html'
      })
      .state('dashboards.create', {
        url: '/create',
        templateUrl: 'modules/dashboards/client/views/create-dashboard.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('dashboards.view', {
        url: '/:dashboardId',
        templateUrl: 'modules/dashboards/client/views/view-dashboard.client.view.html'
      })
      .state('dashboards.edit', {
        url: '/:dashboardId/edit',
        templateUrl: 'modules/dashboards/client/views/edit-dashboard.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// Dashboards controller
var app = angular.module('dashboards');
var obj = {y:'',a:'',b:''};
             var array1=[];
 var content,flag=0,promise;
//var angles = angular.module("angles");

/*
app.chart = function (type) {
	return {
		restrict: "A",
		scope: {
			data: "=",
			options: "=",
			id: "@",
			width: "=",
			height: "="
		},
		link: function ($scope, $elem) {
			var ctx = $elem[0].getContext("2d");

			if ($scope.width <= 0) {
				$elem.width($elem.parent().width());
				$elem.height($elem.parent().height());
				ctx.canvas.width = $elem.width();
				ctx.canvas.height = ctx.canvas.width / 2;
			} else {
				ctx.canvas.width = $scope.width || ctx.canvas.width;
				ctx.canvas.height = $scope.height || ctx.canvas.height;
			}


			var chart = new Chart(ctx);

			$scope.$watch("data", function (newVal, oldVal) {
				// if data not defined, exit
				if (!newVal) return;

				chart[type]($scope.data, $scope.options);
			}, true);
		}
	}
}


/* General Chart Wrapper
app.directive("chart", function () {
	return {
		restrict: "A",
		scope: {
			data: "=",
			type: "@",
			options: "=",
			id: "@",
			width: "=",
			height: "="
		},
		link: function ($scope, $elem) {
			var ctx = $elem[0].getContext("2d");

			if ($scope.width <= 0) {
				$elem.width($elem.parent().width());
				$elem.height($elem.parent().height());
				ctx.canvas.width = $elem.width();
				ctx.canvas.height = ctx.canvas.width / 2;
			} else {
				ctx.canvas.width = $scope.width || ctx.canvas.width;
				ctx.canvas.height = $scope.height || ctx.canvas.height;
			}

			var chart = new Chart(ctx);

			$scope.$watch("data", function (newVal, oldVal) {
				if ($scope.data !== undefined) {
				  chart[$scope.type]($scope.data, $scope.options);
				}
			}, true);
		}
	}
});


// Aliases for various chart types
app.directive("linechart", function () { return app.chart("Line"); });
app.directive("barchart", function () { return app.chart("Bar"); });
app.directive("radarchart", function () { return app.chart("Radar"); });
app.directive("polarchart", function () { return app.chart("PolarArea"); });
app.directive("piechart", function () { return app.chart("Pie"); });
app.directive("doughnutchart", function () { return app.chart("Doughnut"); });
// BC
app.directive("donutchart", function () { return app.chart("Doughnut"); });
*/



app.directive('starRating', function () {
    return {
        scope: {
            rating: '=',
            maxRating: '@',
            readOnly: '@'

        },
        restrict: 'EA',
        template:
            "<div style='display: inline-block;margin: 0px; padding: 0px; cursor:pointer;' ng-repeat='idx in maxRatings track by $index'> \
                    <img ng-src='{{((hoverValue + _rating) <= $index) && \"https://www.codeproject.com/script/ratings/images/star-empty-lg.png\" || \"https://www.codeproject.com/script/ratings/images/star-fill-lg.png\"}}' \
                    ng-Click='isolatedClick($index + 1)' \
                    ng-mouseenter='isolatedMouseHover($index + 1)' \
                    ng-mouseleave='isolatedMouseLeave($index + 1)' style='width:11.8px;'></img> \
            </div>",
        compile: function (element, attrs) {
            if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                attrs.maxRating = '5';
            };
        },
        controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
            $scope.maxRatings = [];

            for (var i = 1; i <= $scope.maxRating; i++) {
                $scope.maxRatings.push({});
            };

            $scope._rating = $scope.rating;
            //console.log("dirctive is ")
            //console.log($scope._rating)
        }]
    };
});

app.controller('DashboardsController', ['$scope','$interval','$timeout', '$stateParams', '$location',  'Authentication', 'Dashboards',
  function ($scope, $interval, $timeout, $stateParams, $location, Authentication, Dashboards) {
    $scope.authentication = Authentication;
    var userStatus = Authentication.user.status;

    if (userStatus == 'Enable') {
      $scope.userEnable = true;
    } else {
      $scope.userEnable = false;
    }

    // Create new dashboard
    $scope.create = function (isValid) {

        console.log("client dashboard create controller")
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'dashboardForm');
        console.log("true...")
        return false;
      }

      // Create new dashboard object
          console.log("client controller create new dashboard object")
      var dashboard = new Dashboards({

        title: this.title,
        //content: this.content
      });
        console.log("value is "+dashboard);
        for(var x in dashboard){
            console.log(x[0]);
        }
      // Redirect after save
      article.$save(function (response) {
          console.log("client controller redirect after save")
        $location.path('dashboards/' + response._id);

        // Clear form fields
        /*$scope.title = '';
        $scope.content = '';*/
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing dashboard
    $scope.remove = function (dashboard) {
        console.log("client controller remove existing dashboard")
      if (dashboard) {
        dashboard.$remove();

        for (var i in $scope.dashboards) {
          if ($scope.dashboards[i] === dashboard) {
            $scope.dashboards.splice(i, 1);
          }
        }
      } else {
        $scope.dashboard.$remove(function () {
          $location.path('dashboards');
        });
      }
    };

    // Update existing dashboards
    $scope.update = function () {
     console.log("client controller update existing dashboard")

      var dashboard = $scope.total;

      dashboard.$update(function (response) {
        //$location.path('dashboards/' + dashboard._id);
          console.log(response);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };


    $scope.stop = function() {
      $interval.cancel(promise);
      flag=0;
    };

    // Find a list of dashboards
     $scope.find = function () {

       $("#load").hide();
       $scope.stop();
         $scope.dashboards = Dashboards.query(function(result){
           //alert($scope.dashboards[0]);
           if($scope.dashboards[0] == "unauthorised"){
             location.reload();
           //  $location.path('authentication/signin');
           }
           else{
              var ratings=[],ticket1=[],events=[];

            console.log(result);
             $scope.scroll = result[0].scroll;
             console.log("scroll is ..");
             console.log($scope.scroll);

             $scope.data1 = result[0].options;

            $scope.total = result[0].total;
            console.log($scope.total.total_created);

            ticket1.push(result[0].latest_tickets);
            $scope.latest_tickets = ticket1;
            console.log($scope.latest_tickets);

             ratings.push(result[0].latest_ratings);
             $scope.latest_ratings = ratings;
             console.log($scope.latest_ratings);

             events.push(result[0].upcoming_events);
             $scope.upcoming_events = events;

             $scope.count = result[0].last_15_days_present.created;
             $scope.count1 = result[0].last_15_days_present.closed;

             $scope.count0 = result[0].last_15_days_present.emp_engaged;
             $scope.count01 = result[0].last_15_days_present.total_emp;

             $scope.units = numDiff(result[0].last_15_days_time.expected_time);
             $scope.units_1 = numDiff(result[0].last_15_days_time.actual_time);

             $scope.last = result[0].last_15_days_present.from;
             $scope.date1 = result[0].last_15_days_present.to;
             console.log($scope.date1);

             $scope.count2 = result[0].last_15_days_previous.created;
             $scope.count3 = result[0].last_15_days_previous.closed;

             $scope.count02 = result[0].last_15_days_previous.emp_engaged;
             $scope.count03 = result[0].last_15_days_previous.total_emp;

             $scope.percent = result[0].last_15_days_present.bar_value;
             $scope.percentage = result[0].last_15_days_previous.bar_value;
             $scope.percentage01 = result[0].last_15_days_time.bar_value;

             $scope.avg_percent = result[0].last_15_days_present.avg_bar_value;
             $scope.avg_percentage = result[0].last_15_days_previous.avg_bar_value;
             $scope.avgutil_percentage = result[0].last_15_days_present.avg_utilvalue;

             $scope.avg_value = result[0].last_15_days_present.avg_utilization;

             $scope.previous = result[0].last_15_days_previous.from;
             $scope.last = result[0].last_15_days_previous.to;

             $scope.num = result[0].last_4_months_present.created;
             $scope.num1 = result[0].last_4_months_present.closed;

             $scope.num0 = result[0].last_4_months_present.emp_engaged;
             $scope.num01 = result[0].last_4_months_present.total_emp;

             $scope.units1 = numDiff(result[0].last_4_months_time.expected_time);
             $scope.units01 = numDiff(result[0].last_4_months_time.actual_time);

             $scope.month_start = result[0].last_4_months_present.from;
             $scope.date11 = result[0].last_4_months_present.to;

             $scope.num2 = result[0].last_4_months_previous.created;
             $scope.num3 = result[0].last_4_months_previous.closed;

             $scope.num02 = result[0].last_4_months_previous.emp_engaged;
             $scope.num03 = result[0].last_4_months_previous.total_emp;

             $scope.percent1 = result[0].last_4_months_present.bar_value;
             $scope.percentage1 = result[0].last_4_months_previous.bar_value;
             $scope.percentage02 = result[0].last_4_months_time.bar_value;

             $scope.avg_percent1 = result[0].last_4_months_present.avg_bar_value;
             $scope.avg_percentage1 = result[0].last_4_months_previous.avg_bar_value;
             $scope.avgutil_percentage1 = result[0].last_4_months_present.avg_utilvalue;

             $scope.avg_value1 = result[0].last_4_months_present.avg_utilization;

             $scope.pre_month_start = result[0].last_4_months_previous.from;
             $scope.month_end = result[0].last_4_months_previous.to;

             $scope.con = result[0].annual_present.created;
             $scope.con1 = result[0].annual_present.closed;

             $scope.con0 = result[0].annual_present.emp_engaged;
             $scope.con01 = result[0].annual_present.total_emp;

             $scope.units2 = numDiff(result[0].annual_time.expected_time);
             $scope.units02 = numDiff(result[0].annual_time.actual_time);

             $scope.year_1 = result[0].annual_present.from;
             $scope.year_2 = result[0].annual_present.to;

             $scope.con2 = result[0].annual_previous.created;
             $scope.con3 = result[0].annual_previous.closed;


             $scope.con02 = result[0].annual_previous.emp_engaged;
             $scope.con03 = result[0].annual_previous.total_emp;

             $scope.percent2 = result[0].annual_present.bar_value;
             $scope.percentage2 = result[0].annual_previous.bar_value;
             $scope.percentage03 = result[0].annual_time.bar_value;

             $scope.avg_percent2 = result[0].annual_present.avg_bar_value;
             $scope.avg_percentage2 = result[0].annual_previous.avg_bar_value;
             $scope.avgutil_percentage2 = result[0].annual_present.avg_utilvalue;

             $scope.avg_value2 = result[0].annual_present.avg_utilization;

             $scope.pre_year = result[0].annual_previous.from;
             $scope.year = result[0].annual_previous.to;



              function numDiff(value) {
               var val = Math.abs(value)
              if (val >= 10000000) {
                val = (val / 10000000).toFixed(2) + ' Cr';
              } else if (val >= 100000) {
                val = (val / 100000).toFixed(2) + ' Lac';
              }
              else if(val >= 1000) val = (val/1000).toFixed(2) + ' K';
              return val;
            }

             $scope.engageddata = result[0].last_15_days_graph.emp_engaged;
             $scope.engagedpercent = result[0].last_15_days_graph.engagedpercent;

             $scope.engageddata1 = result[0].last_4_months_graph.emp_engaged;
             $scope.engagedpercent2 = result[0].last_4_months_graph.engagedpercent;

             $scope.engageddata3 = result[0].annual_graph.emp_engaged;
             $scope.engagedpercent4 = result[0].annual_graph.engagedpercent;

             /*var engageddata = result[0].last_15_days_graph.emp_engaged;
             var engagedpercent = result[0].last_15_days_graph.engagedpercent;*/

             $scope.label_arr = result[0].last_15_days_graph.x_axsis;
             $scope.label = result[0].last_4_months_graph.x_axsis;
             $scope.month = result[0].annual_graph.x_axsis;

             $scope.array = result[0].last_15_days_graph.y_axsis_created;
             $scope.array1 = result[0].last_15_days_graph.y_axsis_closed;

             var array_max = Math.max.apply(Math, $scope.array);
             var array1_max = Math.max.apply(Math, $scope.array1);
             if((Math.max( array1_max,array_max)) == 0){
                 $scope.last_15_max = 1;
             }
             else{
                 $scope.last_15_max = Math.max( array1_max,array_max);
             }


             $scope.array2 = result[0].last_4_months_graph.y_axsis_created;
             $scope.array3 = result[0].last_4_months_graph.y_axsis_closed;

             var array2_max = Math.max.apply(Math, $scope.array2);
             var array3_max = Math.max.apply(Math, $scope.array3);
             if((Math.max( array2_max,array3_max)) == 0){
                 $scope.months_max = 1;
             }
             else{
                 $scope.months_max = Math.max( array2_max,array3_max);
             }


             $scope.arr = result[0].annual_graph.y_axsis_created;
             $scope.arr1 = result[0].annual_graph.y_axsis_closed;

             var arr_max = Math.max.apply(Math, $scope.arr);
             var arr1_max = Math.max.apply(Math, $scope.arr1);
             if((Math.max( arr_max,arr1_max)) == 0){
                 $scope.annual_max = 1;
             }
             else{
                 $scope.annual_max = Math.max( arr_max,arr1_max);
             }


             console.log(Math.ceil($scope.last_15_max/10));
             console.log(Math.round($scope.annual_max/10));
             $scope.check = function(value){
                  content = value;
                 if($scope.selectedText == "Tickets trend"){
                     $("#hidediv").show();
                     $(".hidelist").show();
                     $(".hidelist1").hide();
                     $scope.barchart(content);
                 }
                 else if($scope.selectedText == "Resource utilization trend"){
                     $("#hidediv").hide();
                     $(".hidelist1").show();
                     $(".hidelist").hide();
                     $scope.areachart(content);
                 }
             }




             function callAtInterval(data) {
                 console.log("Interval occurred");
                 switch(data){
                         case 0:
                                content = "15days";
                                $("#btn1").prop('disabled', false);
                                $("#btn2,#btn3").prop('disabled', true);
                                $("#trenddata").val("Tickets trend");
                                $("#trenddata").html("Tickets trend");
                                $scope.barchart(content);
                                $("#hidediv").show();
                                $("#myChart").show();
                                $("#Chart").hide();
                                $("#Chart1").hide();
                                $("#chart").hide();
                                $("#chart1").hide();
                                $("#chart2").hide();
                                $(".hidelist1").hide();
                                $(".hidelist").show();
                                $scope.number=1;
                                $scope.data=0;
                                flag=1;
                                break;
                         case 1:
                                content = "4months";
                                $("#btn2").prop('disabled', false);
                                $("#btn1,#btn3").prop('disabled', true);
                                $("#trenddata").val("Tickets trend");
                                $("#trenddata").html("Tickets trend");
                                $scope.barchart(content);
                                $("#hidediv").show();
                                $("#Chart").show();
                                $("#myChart").hide();
                                $("#Chart1").hide();
                                $("#chart").hide();
                                $("#chart1").hide();
                                $("#chart2").hide();
                                $(".hidelist1").hide();
                                $(".hidelist").show();
                                $scope.number=2;
                                $scope.data=0;
                                flag=2;
                                break;
                         case 2:
                                content = "annual";
                                $("#btn3").prop('disabled', false);
                                $("#btn2,#btn1").prop('disabled', true);
                                $("#trenddata").val("Tickets trend");
                                $("#trenddata").html("Tickets trend");
                                $scope.barchart(content);
                                $("#hidediv").show();
                                $("#Chart1").show();
                                $("#myChart").hide();
                                $("#Chart").hide();
                                $("#chart").hide();
                                $("#chart1").hide();
                                $("#chart2").hide();
                                $(".hidelist1").hide();
                                $(".hidelist").show();
                                $scope.number=3;
                                $scope.data=0;
                                flag=3;
                                break;
                         case 3:
                                content = "15days";
                                $("#btn1").prop('disabled', false);
                                $("#btn2,#btn3").prop('disabled', true);
                                $("#trenddata").val("Resource utilization trend");
                                $("#trenddata").html("Resource utilization trend");
                                $scope.areachart(content);
                                $("#hidediv").hide();
                                $(".hidelist1").show();
                                $(".hidelist").hide();
                                $scope.number=1;
                                $scope.data=0;
                                flag=4;
                                break;
                         case 4:
                                content = "4months";
                                $("#btn2").prop('disabled', false);
                                $("#btn1,#btn3").prop('disabled', true);
                                $("#trenddata").val("Resource utilization trend");
                                $("#trenddata").html("Resource utilization trend");
                                $scope.areachart(content);
                                $("#hidediv").hide();
                                $(".hidelist1").show();
                                $(".hidelist").hide();
                                $scope.number=2;
                                $scope.data=0;
                                flag=5;
                                break;
                         case 5:
                                content = "annual";
                                $("#btn3").prop('disabled', false);
                                $("#btn2,#btn1").prop('disabled', true);
                                $("#trenddata").val("Resource utilization trend");
                                $("#trenddata").html("Resource utilization trend");
                                $scope.areachart(content);
                                $("#hidediv").hide();
                                $(".hidelist1").show();
                                $(".hidelist").hide();
                                $scope.number=3;
                                $scope.data=0;
                                flag=0;
                                break;

                            }
             }

             $scope.barchart = function(value){
                // console.log("value is...."+value);
                 if(value == "15days"){
                     $("#hidediv").show();
                     $("#myChart").show();
                     $("#Chart").hide();
                     $("#Chart1").hide();
                     console.log("in bar graph 15days");
                    var canvas = document.getElementById('myChart');
                      var data = {
                            labels: $scope.label_arr,
                            datasets: [
                                {
                                    label: "Created",
                                    backgroundColor: "#1c84c6",
                                    //borderColor: "rgba(255,99,132,1)",
                                    borderWidth: 2,
                                    hoverBackgroundColor: "#1c84c6",
                                    //hoverBorderColor: "rgba(255,99,132,1)",
                                    data: $scope.array,
                                },
                                {
                                    label: "Closed",
                                    backgroundColor: "#ed5565",
                                    //borderColor: "rgba(255,99,132,1)",
                                    borderWidth: 2,
                                    hoverBackgroundColor: "#ed5565",
                                    //hoverBorderColor: "rgba(255,99,132,1)",
                                    data: $scope.array1,
                                }
                            ]
                        };
                         var option = {
                            scales: {
                            yAxes:[{
                                ticks: {
                                    beginAtZero:true,
                                    min: 0,
                                    //max: 13 ,
                                    stepSize: Math.ceil($scope.last_15_max/10)  // max value by 10
                                },
                                stacked:false,
                                gridLines: {
                                    display:true,
                                    color:"lightgrey"
                                }
                            }],
                            xAxes:[{
                                    gridLines: {
                                    display:false
                                }
                            }]
                          }
                        };

                        var myBarChart = Chart.Bar(canvas,{
                            data:data,
                          options:option
                        });

                 }
                 else if(value == "4months"){
                     $("#Chart").show();
                     $("#myChart").hide();
                     $("#Chart1").hide();
                     console.log("in bar graph 4months");
                     var canvas = document.getElementById('Chart');
                          var data = {
                            labels: $scope.label,
                            datasets: [
                                {
                                    label: "Created",
                                    backgroundColor: "#1c84c6",
                                    //borderColor: "rgba(255,99,132,1)",
                                    borderWidth: 2,
                                    hoverBackgroundColor: "#1c84c6",
                                    //hoverBorderColor: "rgba(255,99,132,1)",
                                    data: $scope.array2,
                                },
                                {
                                    label: "Closed",
                                    backgroundColor: "#ed5565",
                                    //borderColor: "rgba(255,99,132,1)",
                                    borderWidth: 2,
                                    hoverBackgroundColor: "#ed5565",
                                    //hoverBorderColor: "rgba(255,99,132,1)",
                                    data: $scope.array3,
                                }
                            ]
                        };
                    var option = {
                        scales: {
                        yAxes:[{
                            ticks: {
                                beginAtZero:true,
                                min: 0,
                                //max: 10 ,
                                stepSize: Math.ceil($scope.months_max/10)
                            },
                            stacked:false,
                            gridLines: {
                                display:true,
                                color:"lightgrey"
                            }
                        }],
                        xAxes:[{
                                gridLines: {
                                display:false
                            }
                        }]
                      }
                    };

                    var myBarChart = Chart.Bar(canvas,{
                        data:data,
                      options:option
                    });
                }
                 else if(value == "annual"){
                     $("#Chart1").show();
                     $("#myChart").hide();
                     $("#Chart").hide();
                     console.log("in bar graph annual");
                     var canvas = document.getElementById('Chart1');
                     var data = {
                            labels: $scope.month,
                            datasets: [
                                {
                                    label: "Created",
                                    backgroundColor: "#1c84c6",
                                    //borderColor: "rgba(255,99,132,1)",
                                    borderWidth: 2,
                                    hoverBackgroundColor: "#1c84c6",
                                    //hoverBorderColor: "rgba(255,99,132,1)",
                                    data: $scope.arr,
                                },
                                {
                                    label: "Closed",
                                    backgroundColor: "#ed5565",
                                    //borderColor: "rgba(255,99,132,1)",
                                    borderWidth: 2,
                                    hoverBackgroundColor: "#ed5565",
                                    //hoverBorderColor: "rgba(255,99,132,1)",
                                    data: $scope.arr1,
                                }
                            ]
                        };
                      var option = {
                            scales: {
                            yAxes:[{
                                ticks: {
                                    beginAtZero:true,
                                    min: 0,
                                   // max: 10 ,
                                    stepSize: Math.ceil($scope.annual_max/10)
                                },
                                stacked:false,
                                gridLines: {
                                    display:true,
                                    color:"lightgrey"
                                }
                            }],
                            xAxes:[{
                                    gridLines: {
                                    display:false
                                }
                            }]
                          }
                        };

                        var myBarChart = Chart.Bar(canvas,{
                            data:data,
                          options:option
                        });
                 }



             }






             var canvas = document.getElementById('myChart');
                var data = {
                    labels: $scope.label_arr,
                    datasets: [
                        {
                            label: "Created",
                            backgroundColor: "#1c84c6",
                            //borderColor: "rgba(255,99,132,1)",
                            borderWidth: 2,
                            hoverBackgroundColor: "#1c84c6",
                            //hoverBorderColor: "rgba(255,99,132,1)",
                            data: $scope.array,
                        },
                        {
                            label: "Closed",
                            backgroundColor: "#ed5565",
                            //borderColor: "rgba(255,99,132,1)",
                            borderWidth: 2,
                            hoverBackgroundColor: "#ed5565",
                            //hoverBorderColor: "rgba(255,99,132,1)",
                            data: $scope.array1,
                        }
                    ]
                };
              var option = {
                            scales: {
                            yAxes:[{
                                ticks: {
                                    beginAtZero:true,
                                    min: 0,
                                   // max: 13 ,
                                    stepSize: Math.ceil($scope.last_15_max/10)
                                },
                                stacked:false,
                                gridLines: {
                                    display:true,
                                    color:"lightgrey"
                                }
                            }],
                            xAxes:[{
                                    gridLines: {
                                    display:false
                                }
                            }]
                          }
                        };

                        var myBarChart = Chart.Bar(canvas,{
                            data:data,
                          options:option
                        });



              $scope.areachart = function(value){
                // console.log("value is...."+value);
                 if(value == "15days"){
                     $("#chart").empty();
                     $("#chart").show();
                     $("#chart1").hide();
                     $("#chart2").hide();
                     for(var x in $scope.engageddata){
                         array1.push({y:$scope.label_arr[x],a:$scope.engageddata[x],b:$scope.engagedpercent[x]});
                     }
                     console.log("array lablel resource chart ");
                     console.log(array1);
                    Morris.Line({
                           element: 'chart',
                           data : array1,
                           parseTime:false,
                           xkey: 'y',
                          ykeys: ['a', 'b'],
                          labels: ['Total employee engaged', 'Total employee engaged percentage'],
                          lineColors: ['grey', '#1ab394'],
                        });

                     obj = {y:'',a:'',b:''};
                      array1=[];

                 }
                 else if(value == "4months"){
                     $("#chart1").empty();
                     $("#chart").hide()
                     $("#chart1").show();
                     $("#chart2").hide();
                     for(var x in $scope.engageddata1){
                         array1.push({y:$scope.label[x],a:$scope.engageddata1[x],b:$scope.engagedpercent2[x]});
                     }
                     Morris.Line({
                           element: 'chart1',
                           data : array1,
                           parseTime:false,
                           xkey: 'y',
                          ykeys: ['a', 'b'],
                          labels: ['Total employee engaged', 'Total employee engaged percentage'],
                         lineColors: ['grey', '#1ab394'],
                        });

                     obj = {y:'',a:'',b:''};
                      array1=[];
                }
                 else if(value == "annual"){
                     $("#chart2").empty();
                     $("#chart").hide()
                     $("#chart1").hide();
                     $("#chart2").show();
                     for(var x in $scope.engageddata3){
                         array1.push({y:$scope.month[x],a:$scope.engageddata3[x],b:$scope.engagedpercent4[x]});
                     }
                     console.log("array of morris chart is..");
                     console.log(array1);
                    Morris.Line({
                           element: 'chart2',
                           data : array1,
                           parseTime:false,
                           xkey: 'y',
                          ykeys: ['a', 'b'],
                          labels: ['Total employee engaged', 'Total employee engaged percentage'],
                          lineColors: ['grey', '#1ab394'],
                        });

                     obj = {y:'',a:'',b:''};
                      array1=[];
                 }

             }

              $("#chart").hide();
              $("#chart1").hide();
              $("#chart2").hide();
              $(".hidelist1").hide();
              $scope.selectedText = $("#graphchange").find("option:selected").text().trim();
              $("#graphchange").change(function () {
                  $scope.selectedText = $(this).find("option:selected").text().trim();

                  if($scope.selectedText  == "Tickets trend"){
                      $("#btn1,#btn2,#btn3").prop('disabled', false);
                      $scope.stop();
                      $scope.number=0;
                      $("#trenddata").val("");
                      $("#trenddata").html("");
                      $("#hidediv").show();
                      $("#myChart").show();
                      $(".hidelist").show();
                      $("#Chart").hide();
                      $("#Chart1").hide();
                      $("#chart").hide();
                      $("#chart1").hide();
                      $("#chart2").hide();
                      $(".hidelist1").hide();
                      $scope.barchart(content);
                  }else if($scope.selectedText  == "Resource utilization trend"){
                      $("#btn1,#btn2,#btn3").prop('disabled', false);
                      $scope.stop();
                      $scope.number=0;
                      $("#trenddata").val("");
                      $("#trenddata").html("");
                      $("#chart").show();
                      $(".hidelist1").show();
                      if(content == undefined){
                        $scope.areachart("15days");
                      }
                      else{
                          $scope.areachart(content);
                      }

                      $("#myChart").hide();
                      $("#Chart").hide();
                      $("#Chart1").hide();
                      $(".hidelist").hide();
                  }
                  else if($scope.selectedText == "Scroll"){
                      $("#btn1,#btn2,#btn3").prop('disabled', true);
                      if($scope.scroll == ""){ // checking timmer value in db
                        promise = $interval( function(){ callAtInterval(flag); }, 1000);
                      }
                      else{
                          promise = $interval( function(){ callAtInterval(flag); }, $scope.scroll);
                      }
                  }
              });

             /*$("#chart1").hide();
             $("#chart2").hide();
             for(var x in $scope.engageddata){
                 array1.push({y:$scope.label_arr[x],a:$scope.engageddata[x],b:$scope.engagedpercent[x]});
             }

             Morris.Area({
                  element: 'chart',
                   data : array1,
                   parseTime:false,
                   xkey: 'y',
                  ykeys: ['a', 'b'],
                  labels: ['Series A', 'Series B']
                });

             obj = {y:'',a:'',b:''};
              array1=[];*/
            }
            $(document).ready(function () {

              $(".spiner-example").hide();
              $("#load").show();
            });
         });


     };


    // Find existing dashboard
    $scope.findOne = function () {
      $scope.dashboard = Dashboards.get({
        dashboardId: $stateParams.dashboardId
      });
    };
  }


]);

'use strict';

//dashboard service used for communicating with the dashboard REST endpoints
angular.module('dashboards').factory('Dashboards', ['$resource',
  function ($resource) {
    return $resource('api/dashboards/:dashboardId', {
      dashboardId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  },
  
]);
/*
angular.module('dashboards').factory('Dashboards', ['$resource_1',
  function ($resource_1) {
    getCategoryAndBrand   :  $resource+1('api/dashboards/:dashboardId' ,{},{ TypeGetCategoryAndBrand:{method: 'get', isArray:true}})
  },
  
]);



app.factory('itemService', function ($resource) {
return {
        getCategoryAndBrand   :  $resource("/user/categories_brands" ,{},{ TypeGetCategoryAndBrand:{method: 'get', isArray:true}})
    };
});
*/
'use strict';

// Configuring the Filters module
angular.module('filters').run(['Menus',
  function (Menus) {
    /*// Add the filters dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Filters',
      state: 'filters',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'filters', {
      title: 'List Filters',
      state: 'filters.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'filters', {
      title: 'Create Filters',
      state: 'filters.create',
      roles: ['user']
    });
      */

  }
]);

'use strict';

// Setting up route
angular.module('filters').config(['$stateProvider',
  function ($stateProvider) {
    // filters state routing
    $stateProvider
      .state('filters', {
        abstract: true,
        url: '/filters',
        template: '<ui-view/>'
      })
      .state('filters.list', {
        url: '',
        templateUrl: 'modules/filters/client/views/list-filters.client.view.html'
      })
      .state('filters.create', {
        url: '/create',
        templateUrl: 'modules/filters/client/views/create-filter.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('filters.view', {
        url: '/:filterId',
        templateUrl: 'modules/filters/client/views/create-filter.client.view.html'
      })
      .state('filters.edit', {
        url: '/:filterId/edit',
        templateUrl: 'modules/filters/client/views/create-filter.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// Filters controller
var app = angular.module('filters')
var i=0;

app.directive('repeatDone', function() {
    return function(scope, element, attrs) {
        if (scope.$last) { // all are rendered
            scope.$eval(attrs.repeatDone);
            alert("repeat done called");
        }
    }
})

app.controller('FiltersController', ['$scope', '$timeout', '$stateParams', '$location', 'Authentication', 'Filters',
  function ($scope,$timeout, $stateParams, $location, Authentication, Filters) {
    $scope.authentication = Authentication;

    var userStatus = Authentication.user.status;

    if (userStatus == 'Enable') {
      $scope.userEnable = true;
    } else {
      $scope.userEnable = false;
    }

      /*   new ResizeSensor(jQuery('#resizetbl'), function(){
        i++;
        console.log('content dimension changed '+i);
        init();
        pie();
    });*/


      $scope.initDataTable = function() {
        console.log("initdatatables called");
          init();
      }

    function init() {

   console.log("in init function");
            console.log("in initDataTables");
            $timeout(function() {
                  var rowCount = $(".filtertables tr").length;
                 // console.log("Row count value is"+rowCount);
                  if (rowCount >= 0) {
                     //console.log("Entered into Sorting");
                  $('#filtertables').dataTable().fnDestroy()
                       $('#filtertables').dataTable( {
                        //rowReorder: true,
                            "order": [],
                            resposive:true,
                            autoWidth:false,
                            //scrollX:true,
                            dom: 'Bfrtip',
                            buttons: [
                                'colvis'
                            ],
                             columnDefs: [ {
                                targets: [4,6,10,-2,-3], // -2 is reassign, -3 is notification
                                visible: false
                            } ]
                        } );
                       $("div#filtertables_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
                        var styles = {

                            background:"white"
                        };
                        $("div#filtertables_wrapper").find($(".dt-buttons")).find($("a")).css(styles);


                       $('#filtertables').on( 'length.dt', function ( e, settings, len ) {
                            console.log( 'New page length: '+len );
                        } );


                  }
             },1200)
        }

      $scope.generate = function() {

          var columns = [
                {title:"Tickets id", dataKey: "Tickets id"},
                {title:"Status", dataKey: "Status"},
                {title:"Tickets in shifts", dataKey: "Tickets in shifts"},
                {title:"Assigned to", dataKey: "Assigned to"},
                {title:"Tag", dataKey: "Tag"},
                {title:"Complaint", dataKey: "Complaint"},
                {title:"Name", dataKey: "Name"},
                {title:"Phone number", dataKey: "Phone number"},
                {title:"Created date", dataKey: "Created date"},
                {title:"Updated date", dataKey: "Updated date"},
                {title:"Closed date", dataKey: "Closed date"},
                {title:"Actual time(hrs)", dataKey: "Actual time"},
                {title:"Expected time(hrs)", dataKey: "Expected time"},
                {title:"Vendor id", dataKey: "Vendor id"},
                {title: "Escalation level", dataKey: "Escalation level" },
                {title: "Notification", dataKey: "Notification" },
                {title: "Ratings", dataKey: "Ratings" }
            ];

          var rows = [];
          var tbldata = $scope.dashboard;
          console.log(Object.keys(tbldata).length);
          for(var x=0; x<Object.keys(tbldata).length; x++){

              if($scope.dashboard[x].created_time == null){
                  var datevalue = "null";
              }
              else{
                  var datevalue = (($scope.dashboard[x].created_time).replace(/T/, ' ').replace(/\..+/, '').slice(0,-3))
              }
              if($scope.dashboard[x].updated_time == null){
                  var datevalue01 = "null";
              }
              else{
                  var datevalue01 = (($scope.dashboard[x].updated_time).replace(/T/, ' ').replace(/\..+/, '').slice(0,-3))
              }
              if($scope.dashboard[x].closed_time == null){
                  var datevalue1 = "null";
              }
              else{
                  var datevalue1 = (($scope.dashboard[x].closed_time).replace(/T/, ' ').replace(/\..+/, '').slice(0,-3))
              }

              rows[x] = { 'Tickets id': $scope.dashboard[x].ticketId ,
                         Status: $scope.dashboard[x].status,
                         'Tickets in shifts': $scope.dashboard[x].shift,
                         'Assigned to': $scope.dashboard[x].employee.name,
                         'Tag':$scope.dashboard[x].tagid,
                         'Complaint':$scope.dashboard[x].complaint,
                         'Name':$scope.dashboard[x].name,
                         'Phone number':$scope.dashboard[x].phonenumber,
                         'Created date':datevalue,
                         'Updated date':datevalue01,
                         'Closed date':datevalue1,
                         'Actual time':$scope.dashboard[x].actual_hrs,
                         'Expected time':$scope.dashboard[x].expected_hrs,
                         'Vendor id':($scope.dashboard[x].vendor.id),
                         'Escalation level':$scope.dashboard[x].problem.escalationlevel,
                         'Notification':$scope.dashboard[x].problem.notification,
                         'Ratings':$scope.dashboard[x].rating
                        }
          }
          console.log(rows);
          var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth()+1; //January is 0!
                var yyyy = today.getFullYear();
                if(dd<10){
                  dd='0'+dd;
                }
                if(mm<10){
                 mm='0'+mm;
                   }
                var today = dd+'/'+mm+'/'+yyyy;
                   console.log(today);

          var pdfsize = 'a0';
          var doc = new jsPDF('l', 'pt', pdfsize);

          doc.setFontSize(50);
          doc.autoTable(columns,rows, {
            startY: 200,
            theme: 'grid',
            styles: {
              overflow: 'linebreak',
              fontSize: 30,
             // rowHeight: 60,
              //cellPadding:20,
             // columnWidth: 'wrap'
            },
            columnStyles: {
              //1: {columnWidth: 'auto'}
              columnWidth: 100
            },
            addPageContent: function(data) {
                    doc.text("Tickets data",30,90);
                    doc.text("Date: "+today,2900,90);
                }
          });



          doc.save("table.pdf");
        }


       $scope.excel = function() {
          // alert("selected");
         $("#example").table2excel({
                 exclude: ".noExl",
                 name: "Excel Document Name",
         filename: "file_name",
         fileext: ".xls",
         exclude_img: true,
         exclude_links: true,
         exclude_inputs: true
         });
       }


    function datatable_destroy()
        {
         // alert("destroy");
          $('#filtertables').dataTable().fnDestroy();
        }

    // Create new filter
    $scope.create = function () {

        console.log("client filter create controller")

      $(document).ready(function(){
          $(".apply").click(function(){
              datatable_destroy();
              //alert("apply clicked ")
              $scope.dashboard = "";
              //alert($scope.dashboard);
              var apply = $scope.filter1("apply");
              //var result = JSON.stringify(sent);
              console.log(apply[0]);

              var filter = new Filters({
                  apply
                //title: this.title,
                //content: this.content
              });

    // -------------------------Redirect after save--------------
              filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);

                  var dashboard = Object.keys(response.filter1).length;
                  var tablearr=[];
                  console.log(response.filter1);
                  console.log(Object.keys(response.filter1).length);
                  if(dashboard > 100){
                    var datalength = 100;
                  }
                  else{
                    var datalength = dashboard;
                  }
                  for(var x=0; x<datalength ; x++){
                    tablearr.push(response.filter1[x])
                  }
                  $scope.tabledata = tablearr;

                  var dashboard = Object.keys(response.filter1).length;
                  var tablearr=[];
                  console.log(response.filter1);
                  console.log(Object.keys(response.filter1).length);
                  if(dashboard > 100){
                    var datalength = 100;
                  }
                  else{
                    var datalength = dashboard;
                  }
                  for(var x=0; x<datalength ; x++){
                    tablearr.push(response.filter1[x])
                  }
                  $scope.tabledata = tablearr;
                  $scope.dashboard = response.filter1;
                  console.log($scope.dashboard);


                  init();
                  pie();

              }, function (errorResponse) {
                    console.log("error in .....")
                    $scope.error = errorResponse.data.message;
                });
          });



          $("#savehoverbutton").click(function(){

              datatable_destroy();

               console.log("client filter create controller")
              var result = $scope.filter1("save");
              var name = $('#input').val();


          // Create new filter object
              console.log("client controller create new filter object")
          var save = new Filters({
            queryname: name,
            filterquery: result
          });
            console.log("value is "+save);
            console.log(save)
          // Redirect after save
          save.$save(function (response) {
              console.log("client controller redirect after save")
           // $location.path('filters/' + response._id);
              $scope.query=response.saved2;
              $scope.filtername = response.saved1.queryname;
              $scope.id = response.saved1._id;
              console.log("query is...");
              console.log($scope.filtername);
              var str = response.saved1.filterquery;
              for (let obj of str) {
                    obj["vendor.id"] = obj["vendor,id"];
                    delete obj["vendor,id"];
                    obj["escalation.level"] = obj["escalation,level"];
                    delete obj["escalation,level"];
                    obj["notification.time"] = obj["notification,time"];
                    delete obj["notification,time"];
                    obj["employee.name"] = obj["employee,name"];
                    delete obj["employee,name"];
                }
              console.log("str is..");
              console.log(str);
              var apply = str;
              console.log("apply is...");
              console.log(apply);
                var filter = new Filters({
                  apply
                //title: this.titl
                //content: this.content
              });

    // -------------------------Redirect after save--------------
              filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);
                  console.log(response.filter1);

                  var dashboard = Object.keys(response.filter1).length;
                  var tablearr=[];
                  console.log(response.filter1);
                  console.log(Object.keys(response.filter1).length);
                  if(dashboard > 100){
                    var datalength = 100;
                  }
                  else{
                    var datalength = dashboard;
                  }
                  for(var x=0; x<datalength ; x++){
                    tablearr.push(response.filter1[x])
                  }
                  $scope.tabledata = tablearr;
                  $scope.dashboard = response.filter1;
                  init();
                  pie();
                  $("#myBtn").hide();
                  $(".abc").show();

              }, function (errorResponse) {
                    console.log("error in .....")
                    $scope.error = errorResponse.data.message;
                });


            // Clear form fields
            /*$scope.username = '';
            $scope.queryname = '';
            $scope.filterquery = '';*/
          }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
          });



        });



     });
    };


         $scope.filter1 = function (string) {
            // alert("is.... "+string);

                var obj0={},obj=[],obj1={},obj2={},obj3={},obj4={},obj5={},obj6={},obj7={},obj8={},obj9={};
                var arr=[],table;

                if($('#cbSelection').is(":checked")){
                    var key = $('label[for="status"]').text().trim();
                    var data = $("#select1").find("option:selected").text().trim();
                    var data1 = $("#see").val().trim();
                    //alert(data1);
                }
                if($('#s2').is(":checked")){
                    var key1 = $('label[for="name"]').text().trim();
                    var data0 = $("#select2").find("option:selected").text().trim();
                    var data01 = $("#see1").val().trim();
                    //alert(data01);
                }
                 if($('#s02').is(":checked")){
                    var key01 = $('label[for="shift"]').text().trim();
                    var data00 = $("#select02").find("option:selected").text().trim();
                    var data001 = $("#see01").find("option:selected").text().trim();
                    //alert(data01);
                }
                if($('#s20').is(":checked")){
                    var key1 = $('label[for="actual"]').text().trim();
                    var data10 = $("#select20").find("option:selected").text().trim();
                    var data010 = $("#see10").val().trim();
                    var data0100 = $("#see100").val().trim();
                    //alert(data01);
                }
                if($('#s03').is(":checked")){
                    var key20 = $('label[for="expected"]').text().trim();
                   // alert(key2);
                    var data20 = $("#select003").find("option:selected").text().trim();
                    var data020 = $("#see02").val().trim();
                    var data0200 = $("#see002").val().trim();
                    //alert(data02);
                }
                if($('#s3').is(":checked")){
                    var key2 = $('label[for="ticketId"]').text().trim();
                   // alert(key2);
                    var data2 = $("#select03").find("option:selected").text().trim();
                    var data02 = $("#see2").val().trim();
                    //alert(data02);
                }
                if($('#s4').is(":checked")){
                    var key3 = $('label[for="complaint"]').text().trim();
                    var data3 = $("#select4").find("option:selected").text().trim();
                    var data03 = $("#see3").val().trim();
                }
                if($('#s04').is(":checked")){
                    var key30 = $('label[for="tag"]').text().trim();
                    var data30 = $("#select04").find("option:selected").text().trim();
                    var data030 = $("#see03").val().trim();
                }
                if($('#s004').is(":checked")){
                    var key300 = $('label[for="phone number"]').text().trim();
                    var data300 = $("#select004").find("option:selected").text().trim();
                    var data0300 = $("#see003").val().trim();
                }
                if($('#s5').is(":checked")){
                    var key4 = $('label[for="assignedto"]').text().trim();
                    var data4 = $("#select5").find("option:selected").text().trim();
                    var data04 = $("#see4").val().trim();
                }
                if($('#s05').is(":checked")){
                    var key_4 = $('label[for="vendorid"]').text().trim();
                    var data_4 = $("#select05").find("option:selected").text().trim();
                    //var data040 = $("#see040").find("option:selected").text().trim();
                    //alert(data040);
                    var data_04 = $("#see04").val().trim();
                    //alert("data_04 "+ data_04);
                }
                 if($('#s07').is(":checked")){
                    var key_7 = $('label[for="escalationlevel"]').text().trim();
                    var data_7 = $("#select07").find("option:selected").text().trim();
                    var data_07 = $("#see006").val().trim();
                }
                if($('#s005').is(":checked")){
                    var key_40 = $('label[for="notification"]').text().trim();
                    var data_40 = $("#select005").find("option:selected").text().trim();
                     //var data400 = $("#see0040").find("option:selected").text().trim();
                    var data_040 = $("#see004").val().trim();
                }
                if($('#s0005').is(":checked")){
                    var key_400 = $('label[for="rating"]').text().trim();
                    var data_400 = $("#select0005").find("option:selected").text().trim();
                    var data_0400 = $("#see0004").val().trim();
                    //alert(data_400+","+data_0400);
                }
                if($('#s6').is(":checked")){
                    var key5 = $('label[for="create"]').text().trim();

                    var data5 = $("#select6").val().trim();
                    //alert("data5 is"+data5);
                    var data05 = $("#see5").val().trim();
                    var data50 = $("#see50").val().trim();
                    //alert("data05 is"+data05);
                    var data005 = $("#see05").val().trim();
                }
                if($('#s7').is(":checked")){
                    var key6 = $('label[for="update"]').text().trim();
                    var data6 = $("#select7").val().trim();
                    var data06 = $("#see6").val().trim();
                    var data60 = $("#see60").val().trim();
                    var data006 = $("#see06").val().trim();
                }
                if($('#s8').is(":checked")){
                    var key7 = $('label[for="closed"]').text().trim();
                    var data7 = $("#select8").val().trim();
                    var data07 = $("#see7").val().trim();
                    var data70 = $("#see70").val().trim();
                    var data007 = $("#see07").val().trim();
                }

                obj.push(data);
                if(obj[0] != undefined){
                  //alert(data1);
                  if(data1 != ""){
                    obj.push(data1);
                    arr.push({status: obj });
                      // alert("obj[1]"+arr);
                    }
                    else{
                      console.log("nothing selected");
                    //  alert("Select from the second dropdown");
                    }
                  }

        //creator name -------------------
                obj=[];
                obj.push(data0);
                if(obj[0] != undefined){
                  if(data01 == ""){
                    console.log("not selected ");
                  //  alert("Text feild is empty input a name");
                  }
                  else{
                    obj.push(data01);
                    console.log(obj);
                      arr.push({ name: obj });
                  }
                }
        //ticketId------------------------
                obj=[];
                obj.push(data2);
                if(obj[0] != undefined){
                  if(data2 == ""){
                    //alert("Text feild is empty input ticketid");
                  }
                  else{
                    obj.push(data02);
                    //obj2[key2]=obj;
                    arr.push({ ticketId: obj });
                  }
                }
        //actual -------------------
                obj=[];
                obj.push(data10);
                if(obj[0] != undefined){
                  //alert(data010);
                  if(data010 == ""){
                    //alert("First field cant be empty");
                  }
                  else{
                    obj.push(data010);
                        if(data0100 == ""){
                          //alert("Date second feild is empty");
                        }
                          else{
                            obj.push(data0100);
                          }


                    arr.push({ actual_hrs: obj });
                  }

               }
        //expected------------------------
                obj=[];
                obj.push(data20);
                if(obj[0] != undefined){
                  //alert(data020);
                  if(data020 == ""){
                    //alert("First field cant be empty");
                  }
                  else{
                    obj.push(data020);
                        if(data0200 == ""){
                          //alert("Date second feild is empty");
                        }
                          else{
                            obj.push(data0200);
                          }
                          arr.push({expected_hrs: obj });
                          }
                        }
       //complaint--------------------------
                obj=[];

                obj.push(data3);
                 if(obj[0] != undefined){
                   if(data03 == ""){
                     //alert()
                   }
                   else{
                     obj.push(data03);
                     //obj3[key3]=obj;
                     arr.push({ complaint: obj });
                   }

                }
     //tag id--------------------------
                obj=[];

                obj.push(data30);
                 if(obj[0] != undefined){
                   if(data030 == ""){
                    // alert("");
                   }
                   else{
                     obj.push(data030);
                     //obj3[key3]=obj;
                     arr.push({ tagid: obj });
                   }

                }
     //phone number--------------------------
                obj=[];

                obj.push(data300);
                 if(obj[0] != undefined){
                   if(data0300 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data0300);
                     //obj3[key3]=obj;
                     arr.push({ phonenumber: obj });
                   }

                }

    //tickets in shifts-------------------
                   obj=[];

                obj.push(data00);
                if(obj[0] != undefined){
                  if(data001 == ""){
                    //alert("");
                  }
                  else{
                    obj.push(data001);
                    arr.push({ shift: obj });
                  }

               }

        if(string == "apply"){
    //assigned to-------------------------
                obj=[];

                obj.push(data4);
                 if(obj[0] != undefined){
                   if(data04 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data04);
                     //obj4[key4]=obj;
                     arr.push({ 'employee.name': obj });
                   }

                }
    //vendor id-------------------------
                obj=[];

                obj.push(data_4);
                 if(obj[0] != undefined){
                   if(data_04 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data_04);
                     arr.push({ 'vendor.id': obj });
                   }
                }
    //escalation level-------------------------
                obj=[];

                obj.push(data_7);
                 if(obj[0] != undefined){
                   if(data_07 == ""){
                     //alert("");
                   }
                   else{
                    obj.push(data_07);
                    arr.push({ 'problem.escalationlevel': obj });
                   }
                }
     //notification-------------------------
                obj=[];

                obj.push(data_40);
                 if(obj[0] != undefined){
                obj.push(data_040);
                arr.push({ 'problem.notification': obj });

                }

             }
             else{
    //assigned to-------------------------
                obj=[];

                obj.push(data4);
                 if(obj[0] != undefined){
                   if(data04 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data04);
                     //obj4[key4]=obj;
                     arr.push({ 'employee,name': obj });
                   }

                }
    //vendor id-------------------------
                obj=[];

                obj.push(data_4);
                 if(obj[0] != undefined){
                   if(data_04 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data_04);
                     arr.push({ 'vendor,id': obj });
                   }
                }
    //escalation level-------------------------
                obj=[];

                obj.push(data_7);
                 if(obj[0] != undefined){
                   if(data_07 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data_07);
                     arr.push({ 'problem,escalationlevel': obj });
                   }
                }
     //notification-------------------------
                obj=[];

                obj.push(data_40);
                 if(obj[0] != undefined){
                   if(data_040 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data_040);
                     arr.push({ 'problem,notification': obj });
                   }

                }

             }
    //rating--------------------------------
                obj=[];

                obj.push(data_400);
                 if(obj[0] != undefined){
                   if(data_0400 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data_0400);
                     //obj4[key4]=obj;
                     arr.push({ rating: obj });
                   }
                }
                //created----------------------------
                            obj=[];
                        // alert(data5);
                            obj.push(data5);
                            if(obj[0] != undefined){

                                 if(data5 == "is" || data5 == "<=" || data5 == ">=" || data5 == "between"){
                                   console.log("the condition was true");
                                   var data50 = "";
                                   }
                                   else if(data5 == "more than days ago" || data5 == "less than days ago" || data5 == "in the past" || data5 == "days ago"){
                                     var data05 = "";
                                   }
                                   else{
                                     var data05 = "";
                                     var data50 = "";
                                   }
                                   if(data05 != "" || data50 != ""){
                                     if(data50 != ""){
                                       console.log("data50 != null true" + data50);
                                       obj.push(data50);
                                       arr.push({date:{created_time:obj}});
                                     }
                                     else if(data05 != ""){
                                         console.log("data05 != null true");
                                         if(obj == "between"){
                                           obj.push(data05);
                                           obj.push(data005);
                                           arr.push({date:{created_time:obj}});
                                         }
                                         else{
                                           obj.push(data05);
                                           console.log("here");
                                           arr.push({date:{created_time:obj}});
                                         }
                                       }
                                     }
                                     else{
                                       arr.push({date:{created_time:obj}});
                                       }
                                      }

                     //updated----------------------------
                            obj=[];
                        // alert(data6);
                            obj.push(data6);
                            if(obj[0] != undefined){
                                //alert(data6);
                                if(data6 == "is" || data6 == "<=" || data6 == ">=" || data6 == "between"){
                                  console.log("the condition was true");
                                  var data60 = "";
                                  }
                                  else if(data6 == "more than days ago" || data6 == "less than days ago" || data6 == "in the past" || data6 == "days ago"){
                                    var data06 = "";
                                  }
                                  else{
                                    var data06 = "";
                                    var data60 = "";
                                  }
                                if(data06 != "" || data60 != ""){

                                    if(data60 != ""){
                                        console.log("data60 != null true" + data60);
                                        obj.push(data60);
                                        arr.push({date:{updated_time:obj}});
                                    }
                                    else if(data06 != ""){
                                        console.log("data06 != null true");
                                        if(obj == "between"){
                                            obj.push(data06);
                                            obj.push(data006);
                                            arr.push({date:{updated_time:obj}});
                                        }
                                        else{
                                            obj.push(data06);
                                            console.log("here");
                                            arr.push({date:{updated_time:obj}});
                                        }

                                    }
                                }
                                else{
                             arr.push({date:{updated_time:obj}});
                         }
                            }

                   //closed date-----------------------------
                             obj=[];
                        // alert(data7);
                            obj.push(data7);
                            if(obj[0] != undefined){
                                //alert(data7);
                                if(data7 == "is" || data7 == "<=" || data7 == ">=" || data7 == "between"){
                                  console.log("the condition was true");
                                  var data70 = "";
                                  }
                                  else if(data7 == "more than days ago" || data7 == "less than days ago" || data7 == "in the past" || data7 == "days ago"){
                                    var data07 = "";
                                  }
                                  else{
                                    var data07 = "";
                                    var data70 = "";
                                  }
                                if(data07 != "" || data70 != ""){

                                    if(data70 != ""){
                                        console.log("data70 != null true" + data70);
                                        obj.push(data70);
                                        arr.push({date:{closed_time:obj}});
                                    }
                                    else if(data07 != ""){
                                        console.log("data07 != null true");
                                        if(obj == "between"){
                                            obj.push(data07);
                                            obj.push(data007);
                                            arr.push({date:{closed_time:obj}});
                                        }
                                        else{
                                            obj.push(data07);
                                            console.log("here");
                                            arr.push({date:{closed_time:obj}});
                                        }

                                    }
                                }
                                else{
                             arr.push({date:{closed_time:obj}});
                         }
                            }

             //}
    console.log("arr is : "+arr);
             console.log(arr);
                return arr;

        }

    // Remove existing Filter
    $scope.remove = function (filter) {
        console.log("client controller remove existing article")
      if (filter) {
         // alert("in remove if condition");
        filter.$remove();

        for (var i in $scope.filters) {
          if ($scope.filters[i] === filter) {
            $scope.filters.splice(i, 1);
          }
        }
      } else {
          console.log("in remove else condition");
           var remove = new Filters({
            _id:$scope.id
          });
        remove.$remove(function () {
            location.reload();
         // $location.path('filters');
        });
      }
    };



    // Update existing filter
    $scope.update = function () {
     console.log("client controller update existing filter")
        datatable_destroy();

        var name1 = $('#input').val();
        console.log($scope.id);
        var result1 = $scope.filter1("save");//new//
        console.log("result is ... ");
        console.log(result1);
        var filter = new Filters({
            _id:$scope.id,
            queryname: name1,
            filterquery: result1
          });

      //var filter = $scope.filter;
        console.log("filter is ...");
       console.log(filter);//old//new
      filter.$update(function (response) {
        //$location.path('filters/' + filter._id);
          console.log("update res..")
          console.log(response);
           $scope.filtername = response.update.queryname;
              console.log("query is...");
              console.log($scope.filtername);
              $scope.query = response.updatelist;
              var str = response.update.filterquery;

                for (let obj of str) {
                    obj["vendor.id"] = obj["vendor,id"];
                    delete obj["vendor,id"];
                    obj["escalation.level"] = obj["escalation,level"];
                    delete obj["escalation,level"];
                    obj["notification.time"] = obj["notification,time"];
                    delete obj["notification,time"];
                    obj["employee.name"] = obj["employee,name"];
                    delete obj["employee,name"];
                }
              var apply = str;
              console.log("apply is...");
              console.log(apply);
                var filter = new Filters({
                  apply
                //title: this.titl
                //content: this.content
              });

    // -------------------------Redirect after save--------------
              filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);
                  console.log(response.filtr);

                  var dashboard = Object.keys(response.filtr).length;
                  var tablearr=[];
                  console.log(response.filtr);
                  console.log(Object.keys(response.filtr).length);
                  if(dashboard > 100){
                    var datalength = 100;
                  }
                  else{
                    var datalength = dashboard;
                  }
                  for(var x=0; x<datalength ; x++){
                    tablearr.push(response.filtr[x])
                  }
                  $scope.tabledata = tablearr;
                  $scope.dashboard = response.filtr;
                  init();
                  pie();

              }, function (errorResponse) {
                    console.log("error in .....")
                    $scope.error = errorResponse.data.message;
                });


      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };



    // Find a list of Filters
    $scope.find = function () {
      $("#load").hide();
        $scope.filters = Filters.query(function(result){
          //  alert($scope.filters.length);
            if($scope.filters.length == 1){
              alert("true");
              location.reload();
            //  $location.path('authentication/signin');
            }
            else{
            console.log($scope.filters);
            $scope.addfilter = $scope.filters[1][0].addfilter
            //console.log($scope.addfilter);
            $scope.status = $scope.filters[3][0].first;
            $scope.statusSub = $scope.filters[3][0].second;

	  		    $scope.ticketId=$scope.filters[0][0].ticketId;
            //console.log($scope.ticketId)
	  		    //$scope.ticketIdSub=$scope.filters[0][0].ticketId.second;

            $scope.assignedto=$scope.filters[0][0].assignedto;
	  		    //$scope.timeSub=$scope.filters[0][0].time.second;
            $scope.vendor=$scope.filters[0][0].vendor;

            $scope.shift = $scope.filters[0][0].shift.first;
            $scope.shiftSub = $scope.filters[0][0].shift.second;

            $scope.actual=$scope.filters[0][0].actual;
            $scope.expected=$scope.filters[0][0].expected;

		        $scope.tag=$scope.filters[0][0].tag;

            $scope.phoneNo=$scope.filters[0][0].phonenumber;

		  	    $scope.complaint=$scope.filters[0][0].complaint;

		  	    $scope.name=$scope.filters[0][0].name;
	  		    //$scope.nameSub=$scope.filters[0][0].name.second;

            $scope.escalation=$scope.filters[0][0].escalation;
            //$scope.reassignSub=$scope.filters[0][0].reassign.second;

            $scope.notification=$scope.filters[0][0].notification;

            $scope.rating=$scope.filters[0][0].rating;

		        $scope.filterdetails=$scope.filters[0][0].date;

            $scope.query=$scope.filters[2];

            // console.log($scope.query);

                        var dashboard = Object.keys($scope.filters[4]).length;
                        var tablearr=[];
                        console.log($scope.filters[4]);
                        console.log(Object.keys($scope.filters[4]).length);
                        if(dashboard > 100){
                          var datalength = 100;
                        }
                        else{
                          var datalength = dashboard;
                        }
                        for(var x=0; x<datalength ; x++){
                          tablearr.push($scope.filters[4][x])
                        }
                        $scope.tabledata = tablearr;
                        console.log($scope.tabledata);
                        $scope.dashboard = $scope.filters[4];
          }
          $(document).ready(function () {

            $(".spiner-example").hide();
            $("#load").show();
          });
        });




    };

    // Find existing Filter
    $scope.findOne = function () {
        console.log("in findone");
      $scope.filter = Filters.get({
        filterId: $stateParams.filterId
      });
        console.log("findOne..");
        console.log($scope.filter);
        var list = $scope.filter
        console.log(list);
        $scope.dashboard = list.filterlist;
        console.log($scope.dashboard);

    };



             $scope.details = function(id,data,name){

              datatable_destroy();
              $scope.id = id;
              var queryid = data;
              var filter01 = $scope.query;
                 $scope.filtername = name;
                 var str1 = data;


                   for (let obj of str1) {
                        if(obj["vendor,id"] != undefined ){
                            obj["vendor.id"] = obj["vendor,id"];
                            delete obj["vendor,id"];

                        }else if(obj["escalation,level"] != undefined){
                            obj["escalation.level"] = obj["escalation,level"];
                            delete obj["escalation,level"];

                        }else if(obj["notification,time"] != undefined){
                            obj["notification.time"] = obj["notification,time"];
                            delete obj["notification,time"];

                        }else if(obj["employee,name"] != undefined){
                            obj["employee.name"] = obj["employee,name"];
                            delete obj["employee,name"];
                        }
                    }


                   console.log("str1.. is..");
                    console.log(str1);
                    $("#cbSelection").attr('checked',false);
                    $('#s02').attr('checked', false);
                    $('#s2').attr('checked', false);
                    $('#s20').attr('checked', false);
                    $('#s03').attr('checked', false);
                    $('#s3').attr('checked', false);
                    $('#s4').attr('checked', false);
                    $('#s04').attr('checked', false);
                    $('#s004').attr('checked', false);
                    $('#s5').attr('checked', false);
                    $('#s05').attr('checked', false);
                    $('#s07').attr('checked', false);
                    $('#s005').attr('checked', false);
                    $('#s0005').attr('checked', false);
                    $('#s6').attr('checked', false);
                    $('#s8').attr('checked', false);
                    $("s1").hide();
                 hide();
                    for(var x in str1){

                     console.log(Object.keys(str1[x]));


                     if(Object.keys(str1[x]) == "status"){ //---status ---

                       // alert("in..");
                         $("s1").show();
                         $("#cbSelection").attr('checked',true);
                         console.log(str1[x]["status"][0]);
                         var drop = str1[x]["status"][0];
                         $("#select1").val(drop);
                         var txt = str1[x]["status"][1];
                         $("#see").val(txt);

                     }

                     if(Object.keys(str1[x]) == "ticketId"){ //---ticket id---

                         $(".ticketId").show();
                         $("s3").show()
                         $('#s3').attr('checked', true);
                         console.log(str1[x]["ticketId"][0]);
                         var drop = str1[x]["ticketId"][0];
                         $("#select03").val(drop);
                         var txt = str1[x]["ticketId"][1];
                         $("#see2").val(txt);

                     }
                     if(Object.keys(str1[x]) == "shift"){ // ---shift---

                         $(".shift").show();
                         $("s02").show()
                         $('#s02').attr('checked', true);
                         console.log(str1[x]["shift"][1]);
                         var drop = str1[x]["shift"][0];
                         $("#select02").val(drop);
                         var txt = str1[x]["shift"][1];
                         $("#see01").val(txt);

                     }
                    if(Object.keys(str1[x]) == "expected_hrs"){ //---expected---

                         $(".expected").show();
                         $("s03").show()
                         $('#s03').attr('checked', true);
                         console.log(str1[x]["expected"][0]);
                         var drop = str1[x]["expected"][0];
                         $("#select003").val(drop);
                         var txt = str1[x]["expected"][1];
                         $("#see02").val(txt);

                     }
                    if(Object.keys(str1[x]) == "actual_hrs"){ // ---actual---

                         $(".actual").show();
                         $("s20").show()
                         $('#s20').attr('checked', true);
                         console.log(str1[x]["actual"][0]);
                         var drop = str1[x]["actual"][0];
                         $("#select20").val(drop);
                         var txt = str1[x]["actual"][1];
                         $("#see10").val(txt);

                     }
                    if(Object.keys(str1[x]) == "name"){ // ---name---

                         $(".name").show();
                         $("s2").show()
                         $('#s2').attr('checked', true);
                         console.log(str1[x]["name"][0]);
                         var drop = str1[x]["name"][0];
                         $("#select2").val(drop);
                         var txt = str1[x]["name"][1];
                         $("#see1").val(txt);

                     }
                    if(Object.keys(str1[x]) == "complaint"){ // ---complaint---

                         $(".complaint").show();
                         $("s4").show()
                         $('#s4').attr('checked', true);
                         console.log(str1[x]["complaint"][0]);
                         var drop = str1[x]["complaint"][0];
                         //alert(drop);
                         $("#select4").val(drop);
                         var txt = str1[x]["complaint"][1];
                         $("#see3").val(txt);

                     }
                    if(Object.keys(str1[x]) == "tagid"){//---tag----

                         $(".tag").show();
                         $("s04").show()
                         $('#s04').attr('checked', true);
                         console.log(str1[x]["tagid"][0]);
                         var drop = str1[x]["tagid"][0];
                         $("#select04").val(drop);
                         var txt = str1[x]["tagid"][1];
                         $("#see03").val(txt);

                     }
                    if(Object.keys(str1[x]) == "phonenumber"){ //----phone number-----

                         $(".phoneN0").show();
                         $("s004").show()
                         $('#s004').attr('checked', true);
                         console.log(str1[x]["phonenumber"][0]);
                         var drop = str1[x]["phonenumber"][0];
                         $("#select004").val(drop);
                         var txt = str1[x]["phonenumber"][1];
                         $("#see003").val(txt);

                     }
                     if(Object.keys(str1[x]) == "employee.name"){ //----assigned to -----

                         $(".assignedto").show();
                         $("s5").show()
                         $('#s5').attr('checked', true);
                         console.log(str1[x]["employee.name"][0]);
                         var drop = str1[x]["employee.name"][0];
                         $("#select5").val(drop);
                         var txt = str1[x]["employee.name"][1];
                         $("#see4").val(txt);

                     }
                    if(Object.keys(str1[x]) == "vendor.id"){ //----vendor id -----

                         $(".vendorid").show();
                         $("s05").show()
                         $('#s05').attr('checked', true);
                         console.log(str1[x]["vendor.id"][0]);
                         var drop = str1[x]["vendor.id"][0];
                         $("#select05").val(drop);
                         var txt = str1[x]["vendor.id"][1];
                         $("#see04").val(txt);

                     }
                    if(Object.keys(str1[x]) == "escalation.level"){ //----escalation level -----

                         $(".reassign").show();
                         $("s05").show()
                         $('#s05').attr('checked', true);
                         console.log(str1[x]["escalation.level"][0]);
                         var drop = str1[x]["escalation.level"][0];
                         $("#select05").val(drop);
                         var txt = str1[x]["escalation.level"][1];
                         $("#see04").val(txt);

                     }
                    if(Object.keys(str1[x]) == "notification.time"){ //----notification  -----

                         $(".notification").show();
                         $("s005").show()
                         $('#s005').attr('checked', true);
                         console.log(str1[x]["notification.time"][0]);
                         var drop = str1[x]["notification.time"][0];
                         $("#select005").val(drop);
                         var txt = str1[x]["notification.time"][1];

                         $("#see004").val(txt);

                     }


                    if(Object.keys(str1[x]) == "rating"){ //----rating -----

                         $(".rating").show();
                         $("s0005").show()
                         $('#s0005').attr('checked', true);
                         console.log(str1[x]["rating"][0]);
                         var drop = str1[x]["rating"][0];
                         $("#select0005").val(drop);
                         var txt = str1[x]["rating"][1];
                         $("#see0004").val(txt);

                     }
                     if(Object.keys(str1[x]) == "date"){
                         console.log("date....")
                         console.log(Object.keys(str1[x]["date"]));
                         if(Object.keys(str1[x]["date"]) == "created_time"){ //----created -----

                         $(".created").show();
                         $("s6").show()
                         $('#s6').attr('checked', true);
                         console.log(str1[x]["date"]["created_time"][0]);
                         var drop = str1[x]["date"]["created_time"][0];
                         $("#select6").val(drop);
                         var txt = str1[x]["date"]["created_time"][1];
                         var txt1 = str1[x]["date"]["created_time"][2];

                         if(drop  == "is" || drop == ">=" || drop == "<="){
                                      $(".se1").val(txt);
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }
                                    else if(drop  == "between"){
                                      $(".se1").val(txt);
                                      $(".see1").show();
                                      $(".see1").val(txt1);
                                      $(".see01").hide();
                                    }

                                   else if(drop  == "less than days ago"|| drop == "more than days ago" || drop == "in the past"|| drop == "days ago" ){
                                      $(".see01").show();
                                      $(".see01").val(txt);
                                      $(".se1").hide();
                                      $(".see1").hide();
                                    }
                                else{
                                      $(".se1").hide();
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }
                         }

                    if(Object.keys(str1[x]["date"]) == "updated_time"){ //----updated -----

                         $(".updated").show();
                         $("s6").show()
                         $('#s6').attr('checked', true);
                         console.log(str1[x]["date"]["updated_time"][0]);
                         var drop = str1[x]["date"]["updated_time"][0];
                         $("#select6").val(drop);
                         var txt = str1[x]["date"]["updated_time"][1];
                         var txt1 = str1[x]["date"]["updated_time"][2];

                         if(drop  == "is" || drop == ">=" || drop == "<="){
                                      $(".se1").val(txt);
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }
                                    else if(drop  == "between"){
                                      $(".se1").val(txt);
                                      $(".see1").show();
                                      $(".see1").val(txt1);
                                      $(".see01").hide();
                                    }

                                   else if(drop  == "less than days ago"|| drop == "more than days ago" || drop == "in the past"|| drop == "days ago" ){
                                      $(".see01").show();
                                      $(".see01").val(txt);
                                      $(".se1").hide();
                                      $(".see1").hide();
                                    }
                                else{
                                      $(".se1").hide();
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }
                    }

                    if(Object.keys(str1[x]["date"]) == "closed_time"){ //----closed -----

                         $(".closed").show();
                         $("s8").show()
                         $('#s8').attr('checked', true);
                         console.log(str1[x]["date"]["closed_time"][0]);
                         var drop = str1[x]["date"]["closed_time"][0];
                         $("#select8").val(drop);
                         var txt = str1[x]["date"]["closed_time"][1];
                         var txt1 = str1[x]["date"]["closed_time"][2];

                          if(drop  == "is" || drop == ">=" || drop == "<="){
                                      $(".se3").val(txt);
                                      $(".see3").hide();
                                      $(".see03").hide();
                                    }
                                    else if(drop  == "between"){
                                      $(".se3").val(txt);
                                      $(".see3").show();
                                      $(".see3").val(txt1);
                                      $(".see03").hide();
                                    }

                                   else if(drop  == "less than days ago"|| drop == "more than days ago" || drop == "in the past"|| drop == "days ago" ){

                                      $(".see03").show();
                                      $(".see03").val(txt);
                                      $(".se3").hide();
                                      $(".see3").hide();
                                    }
                                else{
                                      $(".se3").hide();
                                      $(".see3").hide();
                                      $(".see03").hide();
                                    }


                     }
                    }

                 }
                 //alert("after..");
                      var apply = str1;
                    console.log("apply is .. ")
                    console.log(apply);
                      var filter = new Filters({
                          apply
                      });
                 str1="";

    // -------------------------Redirect after save--------------
                      filter.$save(function (response) {
                          //filter.$query(function (response) {
                          console.log("client controller redirect after save")
                          //$location.path('filters/' + response._id);
                          console.log("response is.. " + response);
                          console.log(response.filter1);

                          var dashboard = Object.keys(response.filter1).length;
                          var tablearr=[];
                          console.log(response.filter1);
                          console.log(Object.keys(response.filter1).length);
                          if(dashboard > 100){
                            var datalength = 100;
                          }
                          else{
                            var datalength = dashboard;
                          }
                          for(var x=0; x<datalength ; x++){
                            tablearr.push(response.filter1[x])
                          }
                          $scope.tabledata = tablearr;
                          $scope.dashboard = response.filter1;
                          init();
                          pie();

                      }, function (errorResponse) {
                            console.log("error in .....")
                            $scope.error = errorResponse.data.message;
                        });

             }



      function pie(){
        $timeout(function() {
            $("span.pie").peity("pie");
                              $(".pie-colours-1").peity("pie", {
                                  fill: function(value) {
                                      console.log("value is .. "+ value);
                                   // return value <= 50 ? "green" : value > 75 ? "red" : "orange"
                                      if(value > 5 ){
                                          return("#ed5565");
                                      }
                                      else if(value > 3){
                                          return("#f8ac59");
                                      }
                                      else{
                                          return("#1ab394");
                                      }
                                  }
                                });
          },900);
      }


      function hide(){

           $(".name").hide();
           $(".shift").hide();
           $(".actual").hide();
           $(".expected").hide();
           $(".ticketId").hide();
           $(".complaint").hide();
           $(".tag").hide();
           $(".phoneNo").hide();
           $(".assignedto").hide();
           $(".vendorid").hide();
           $(".escalationlevel").hide();
           $(".notification").hide();
           $(".rating").hide();
           $(".created").hide();
           $(".updated").hide();
           $(".closed").hide();
           $(".startdate").hide();
           $(".duedate").hide();

            $("s02").hide();
            $("s2").hide();
            $("s20").hide();
            $("s03").hide();
            $("s3").hide();
            $("s4").hide();
            $("s04").hide();
            $("s07").hide();
            $("s004").hide();
            $("s5").hide();
            $("s05").hide();
            $("s005").hide();
            $("s0005").hide();
            $("s6").hide();
            $("s7").hide();
            $("s8").hide();
            $("s9").hide();
            $("s10").hide();
    }


      $scope.filterdata = function() {

           pie();
            //alert("hiii");
              $timeout(function() {

                    function clearAll() {
                        //location.reload();
                        $('#load').load(document.URL +  ' #load');
                    }



                   /*   $("span.pie").peity("pie");
                              $(".pie-colours-1").peity("pie", {
                                  fill: function(value) {
                                      //console.log("value is .. "+ value);
                                   // return value <= 50 ? "green" : value > 75 ? "red" : "orange"
                                      if(value > 75 ){
                                          return("#ed5565");
                                      }
                                      else if(value > 50){
                                          return("#f8ac59");
                                      }
                                      else{
                                          return("#1ab394");
                                      }

                                  }
                                });*/
                    $('.select30 option:nth-child(2)').attr('disabled', 'disabled');// to disable status by default

                    $(document).ready(function(){
                        $(".myBtn").click(function(){
                            $("#myModal").modal();
                        });
                    });

                    var number=[""]
                       function addingnumber(){
                        var x=document.getElementById("box");
                         number.push(document.getElementById("input").value);
                        x.innerHTML=number.join('<br/>');
                       }

                    $(document).ready(function () {
                        $(".abc").hide();
                        //$(".queryname").on('click','li',function (){
                        $(".titlename").click(function() {
                          alert("li clicked..");
                          var send = $(this).html();
                            console.log(send);
                            $(".abc").show(); // will display edit and delete button
                            $(".name1").val(send);
                            $(".name2").html(send);

                             $("#newquery1").show();
                            $("#myBtn").hide();
                        });
                    });


                    $(document).ready(function(){
                        $("#edit").hide();
                        $("#newquery1").hide();
                        $(".edit").click(function(){
                            $("#save").hide();
                            $("#edit").show();
                            $("#newquery").hide();

                        });
                    });




                    $('#more').click(function () {
                        $(this).find('i').toggleClass('fa fa-caret-down').toggleClass('fa fa-caret-right');
                    });

                    $(".cbSelection").click(function(){
                        if($(this).is(":checked")){
                           // alert('true');
                            $("s1").show();
                        }else{
                            $("s1").hide();
                        }
                    });


                  //  <!----------------hide sub options  ---------------->
                    $(document).ready(function () {
                        $("s2").hide();
                        $("#s2").click(function(){
                            if($(this).is(":checked")){
                                $("s2").show();
                            }else{
                                $("s2").hide();
                            }
                        });

                         $("s02").hide();
                        $("#s02").click(function(){
                            if($(this).is(":checked")){
                                $("s02").show();
                            }else{
                                $("s02").hide();
                            }
                        });

                        $("s20").hide();
                        $("#s20").click(function(){
                            if($(this).is(":checked")){
                                $("s20").show();
                            }else{
                                $("s20").hide();
                            }
                        });


                        $("s03").hide();
                        $("#s03").click(function(){
                            if($(this).is(":checked")){
                                $("s03").show();
                            }else{
                                $("s03").hide();
                            }
                        });


                        $("s3").hide();
                        $("#s3").click(function(){
                            if($(this).is(":checked")){
                                $("s3").show();
                            }else{
                                $("s3").hide();
                            }
                        });


                        $("s4").hide();
                        $("#s4").click(function(){
                            if($(this).is(":checked")){
                                $("s4").show();
                            }else{
                                $("s4").hide();
                            }
                        });

                        $("s04").hide();
                        $("#s04").click(function(){
                            if($(this).is(":checked")){
                                $("s04").show();
                            }else{
                                $("s04").hide();
                            }
                        });

                        $("s004").hide();
                        $("#s004").click(function(){
                            if($(this).is(":checked")){
                                $("s004").show();
                            }else{
                                $("s004").hide();
                            }
                        });

                        $("s5").hide();
                        $("#s5").click(function(){
                            if($(this).is(":checked")){
                                $("s5").show();
                            }else{
                                $("s5").hide();
                            }
                        });

                        $("s05").hide();
                        $("#s05").click(function(){
                            if($(this).is(":checked")){
                                $("s05").show();
                            }else{
                                $("s05").hide();
                            }
                        });
                        $("s07").hide();
                        $("#s07").click(function(){
                            if($(this).is(":checked")){
                                $("s07").show();
                            }else{
                                $("s07").hide();
                            }
                        });

                        $("s005").hide();
                        $("#s005").click(function(){
                            if($(this).is(":checked")){
                                $("s005").show();
                            }else{
                                $("s005").hide();
                            }
                        });

                        $("s0005").hide();
                        $("#s0005").click(function(){
                            if($(this).is(":checked")){
                                $("s0005").show();
                            }else{
                                $("s0005").hide();
                            }
                        });

                        $("s6").hide();
                        $("#s6").click(function(){
                            if($(this).is(":checked")){
                                $("s6").show();
                            }else{
                                $("s6").hide();
                            }
                        });

                        $("s7").hide();
                        $("#s7").click(function(){
                            if($(this).is(":checked")){
                                $("s7").show();
                            }else{
                                $("s7").hide();
                            }
                        });

                        $("s8").hide();
                        $("#s8").click(function(){
                            if($(this).is(":checked")){
                                $("s8").show();
                            }else{
                                $("s8").hide();
                            }
                        });

                        $("s9").hide();
                        $("#s9").click(function(){
                            if($(this).is(":checked")){
                                $("s9").show();
                            }else{
                                $("s9").hide();
                            }
                        });

                        $("s10").hide();
                        $("#s10").click(function(){
                            if($(this).is(":checked")){
                                $("s10").show();
                            }else{
                                $("s10").hide();
                            }
                        });
                    });

                    $(function () {
                         //$("#see").hide();

                            $("#select1").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                        if(selectedText  == "open"|| selectedText=="closed" || selectedText=="any"){

                          $("#see").hide();
                        }else{
                          $("#see").show();
                        }

                            });

                        $("#see100").hide();
                        $("#select20").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                if(selectedText  == "between"){

                                  $("#see100").show();
                                }else{
                                  $("#see100").hide();
                                }

                            });
                        $('#see002').hide();
                        $("#select003").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                if(selectedText  == "between"){

                                  $("#see002").show();
                                }else{
                                  $("#see002").hide();
                                }

                            });



                         $(".see1").hide();
                         $(".see01").hide();
                            $(".select1").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                if(selectedText  == "is" || selectedText == ">=" || selectedText == "<="){
                                      $(".se1").show();
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }
                                    else if(selectedText  == "between"){
                                      $(".se1").show();
                                      $(".see1").show();
                                      $(".see01").hide();
                                    }

                                   else if(selectedText  == "less than days ago"|| selectedText == "more than days ago" || selectedText == "in the past"|| selectedText == "days ago" ){

                                      $(".see01").show();
                                      $(".se1").hide();
                                      $(".see1").hide();
                                    }
                                else{
                                      $(".se1").hide();
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }
                                });

                         $(".see2").hide();
                         $(".see02").hide();
                            $(".select2").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                if(selectedText  == "is" || selectedText == ">=" || selectedText == "<="){
                                      $(".se2").show();
                                      $(".see2").hide();
                                      $(".see02").hide();
                                    }
                                    else if(selectedText  == "between"){
                                      $(".se2").show();
                                      $(".see2").show();
                                      $(".see02").hide();
                                    }

                                   else if(selectedText  == "less than days ago"|| selectedText == "more than days ago" || selectedText == "in the past"|| selectedText == "days ago" ){

                                      $(".see02").show();
                                      $(".se2").hide();
                                      $(".see2").hide();
                                    }
                                else{
                                      $(".se2").hide();
                                      $(".see2").hide();
                                      $(".see02").hide();
                                    }
                                });

                        $(".see3").hide();
                        $(".see03").hide();
                            $(".select3").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                 if(selectedText  == "is" || selectedText == ">=" || selectedText == "<="){
                                      $(".se3").show();
                                      $(".see3").hide();
                                      $(".see03").hide();
                                    }
                                    else if(selectedText  == "between"){
                                      $(".se3").show();
                                      $(".see3").show();
                                      $(".see03").hide();
                                    }

                                   else if(selectedText  == "less than days ago"|| selectedText == "more than days ago" || selectedText == "in the past"|| selectedText == "days ago" ){

                                      $(".see03").show();
                                      $(".se3").hide();
                                      $(".see3").hide();
                                    }
                                else{
                                      $(".se3").hide();
                                      $(".see3").hide();
                                      $(".see03").hide();
                                    }
                                });
                    });

                    $(function () {

                        hide();


                        var selectedText=[]

                    var checkedtext=[]

                            $(".select30").change(function () {

                                 selectedText = $(this).find("option:selected").attr('disabled','disabled').text().trim();   console.log("\n selected text is...... "+selectedText+"\n...");
                        if(selectedText  == "name"){
                          $(".name").show();
                     $('#s2').val(this.checked);
                    $('#s2').prop('checked',true);
                        $("s2").show();

                        }
                        else if(selectedText  == "ticketId"){
                            $(".ticketId").show();
                            $('#s3').val(this.checked);
                            $('#s3').prop('checked',true);
                            $("s3").show();


                        }
                         else if(selectedText  == "tickets in shift"){
                            $(".shift").show();
                            $('#s02').val(this.checked);
                            $('#s02').prop('checked',true);
                            $("s02").show();
                        }
                        else if(selectedText  == "actual time"){
                            $(".actual").show();
                            $('#s20').val(this.checked);
                            $('#s20').prop('checked',true);
                            $("s20").show();
                        }
                        else if(selectedText  == "expected time"){
                            $(".expected").show();
                            $('#s03').val(this.checked);
                            $('#s03').prop('checked',true);
                            $("s03").show();

                        }
                        else if(selectedText  == "complaint"){
                            $(".complaint").show();
                            $('#s4').val(this.checked);
                            $('#s4').prop('checked',true);
                            $("s4").show();
                            checkedtext="complaint"

                        }
                       else if(selectedText  == "tag"){
                            $(".tag").show();
                            $('#s04').val(this.checked);
                            $('#s04').prop('checked',true);
                            $("s04").show();
                            checkedtext="tag"


                        }else if(selectedText  == "phone number"){
                            $(".phoneNo").show();
                            $('#s004').val(this.checked);
                            $('#s004').prop('checked',true);
                            $("s004").show();
                            checkedtext="phone number"


                        }else if(selectedText  == "assigned to"){
                            $(".assignedto").show();
                            $('#s5').val(this.checked);
                            $('#s5').prop('checked',true);
                            $("s5").show();
                            checkedtext="assignedto"

                        }else if(selectedText  == "vendor id"){
                            $(".vendorid").show();
                            $('#s05').val(this.checked);
                            $('#s05').prop('checked',true);
                            $("s05").show();
                            checkedtext="vendor id"

                        }else if(selectedText  == "escalation level"){
                            $(".escalationlevel").show();
                            $('#s07').val(this.checked);
                            $('#s07').prop('checked',true);
                            $("s07").show();
                            checkedtext="escalation level"

                        }else if(selectedText  == "notification"){
                            $(".notification").show();
                            $('#s005').val(this.checked);
                            $('#s005').prop('checked',true);
                            $("s005").show();
                            checkedtext="notification"

                        }else if(selectedText  == "rating"){
                            $(".rating").show();
                            $('#s0005').val(this.checked);
                            $('#s0005').prop('checked',true);
                            $("s0005").show();
                            checkedtext="rating"

                        } else if(selectedText  == "created date"){
                            $(".created").show();
                            $('#s6').val(this.checked);
                            $('#s6').prop('checked',true);
                            $("s6").show();

                        }
                        else if(selectedText  == "updated date"){
                            $(".updated").show();
                            $('#s7').val(this.checked);
                            $('#s7').prop('checked',true);
                            $("s7").show();

                        }
                        else if(selectedText  == "closed date"){
                            $(".closed").show();
                            $('#s8').val(this.checked);
                            $('#s8').prop('checked',true);
                            $("s8").show();

                        }
                        else if(selectedText  == "start date"){
                            $(".startdate").show();
                            $('#s9').val(this.checked);
                            $('#s9').prop('checked',true);
                            $("s9").show();

                        }
                        else if(selectedText  == "due date"){
                            $(".duedate").show();
                            $('#s10').val(this.checked);
                            $('#s10').prop('checked',true);
                            $("s10").show();

                        }



                            });

                        });

                    $( function (){
                        $("#clear").click(function(){
                        $(".name").hide();
                        $(".ticketId").hide();
                        $(".shift").hide();
                        $(".actual").hide();
                        $(".expected").hide();
                        $(".complaint").hide();
                        $(".assignedto").hide();
                        $(".tag").hide();
                        $(".phoneNo").hide();
                        $(".assignedto").hide();
                        $(".vendorid").hide();
                        $(".escalationlevel").hide();
                        $(".notification").hide();
                        $(".rating").hide();
                        $(".created").hide();
                        $(".updated").hide();
                        $(".closed").hide();
                        $(".startdate").hide();
                        $(".duedate").hide();
                        })
                    })


                    $(document).ready(function()
                    {
                     $("#saveoption").click(function(){
                      showpopup();
                     });
                     $("#close_login").click(function(){
                      hidepopup();
                     });
                    });

                    function showpopup()
                    {
                     $("#loginform").fadeIn();
                     $("#loginform").css({"visibility":"visible","display":"block"});
                    }

                    function hidepopup()
                    {
                     $("#loginform").fadeOut();
                     $("s1");
                     $("#loginform").css({"visibility":"hidden","display":"none"});
                    }

                     $("#myBtn").click(function(){
                            $("#myModal").modal();
                        });




                    var app = angular.module('angularjs-starter', []);

                    app.controller('MainCtrl', ["$scope", function($scope) {
                      $scope.name = 'World';
                    }]);

                    app = angular.module('app', []);

                    app.config(['$compileProvider',
                        function ($compileProvider) {
                            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob|data):/);
                    }]);

                    app.controller('ctrl', ["$scope", function($scope) {

                    }]);



               }, 200)
        }




  }

]);

function clearAll() {
                        location.reload();
                    }

'use strict';

//filters service used for communicating with the filters REST endpoints
angular.module('filters').factory('Filters', ['$resource',
  function ($resource) {
    return $resource('api/filters/:filterId', {
      filterId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);


'use strict';

// Configuring the orgcharts module
angular.module('orgcharts').run(['Menus',
  function (Menus) {
    /*// Add the orgcharts dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Organization charts',
      state: 'orgcharts',
      type: 'dropdown',
      iconClass:' fa-bar-chart-o',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'orgcharts', {
      title: 'Employee',
      state: 'orgcharts.create'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'orgcharts', {
      title: 'Location',
      state: 'orgcharts.edit',
      roles: ['user']
    });
      */
     
  }
]);

'use strict';

// Setting up route
angular.module('orgcharts').config(['$stateProvider',
  function ($stateProvider) {
    // orgcharts state routing
    $stateProvider
      .state('orgcharts', {
        abstract: true,
        url: '/orgcharts',
        template: '<ui-view/>'
      })
      .state('orgcharts.list', {
        url: '',
        templateUrl: 'modules/orgcharts/client/views/list-orgcharts.client.view.html'
      })
      .state('orgcharts.create', {
        url: '/create',
        templateUrl: 'modules/orgcharts/client/views/create-orgchart.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('orgcharts.view', {
        url: '/edit',
        templateUrl: 'modules/orgcharts/client/views/edit-orgchart.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('orgcharts.edit', {
        url: '/:orgchartId/edit',
        templateUrl: 'modules/orgcharts/client/views/edit-orgchart.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// orgcharts controller
var app = angular.module('orgcharts').controller('OrgchartsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Orgcharts',
  function ($scope, $stateParams, $location, Authentication, Orgcharts) {
    $scope.authentication = Authentication;

    var userStatus = Authentication.user.status;

    if (userStatus == 'Enable') {
      $scope.userEnable = true;
    } else {
      $scope.userEnable = false;
    }

    // Create new orgchart
    $scope.create = function () {
        $("#emplist").hide();
        $("#loclist").hide();
        // Create new orgchart object
        console.log("client controller create new orgchart object");
        $(document).ready(function(){
            $("#btn").click(function(){
                var selectedvalue = $("#emplist").find("option:selected").text().trim();
                console.log("selectedvalue "+" , "+selectedvalue);
                if(selectedvalue == ""){
                var value = document.getElementById('empid').value;
                }
                else{
                    var split = selectedvalue.split(",");
                    var v1 = split[0];
                    var v2 = split[1];
                    var value = v1;
                }
                console.log(value)
                if(value == ""){
                    $('#chart-container').empty();
                }
                else{
                    var orgchart = new Orgcharts({
                        empid: value
                    });
                    console.log("value is "+orgchart);
                    console.log(orgchart);
                    // Redirect after save
                    orgchart.$save(function (response) {
                        console.log("client controller redirect after save")
                        console.log("id is..");
                        alert(response.data1);
                        console.log(response.data1);
                        $( "#chart-container" ).empty();
                        if((response.id === "" || response.id === undefined)){
                            //alert("in undefined")
                            var list = response.data1;
                            if(response.data1 == ""){
                                $("#error").text("invalid employee details");
                                $("#error").html("invalid employee details");
                            }
                            else{
                                $("#emplist").show();
                                var select = document.getElementById("emplist");
                                var options = list;
                                for(var i = 0; i < options.length; i++) {
                                    var opt = options[i];
                                    var emplist = document.createElement("option");
                                    emplist.textContent = opt;
                                    emplist.value = opt;
                                    select.appendChild(emplist);
                                }
                                $("#error").text("duplicate values exists select respective Id");
                                $("#error").html("duplicate values exists select respective Id");
                            }

                        }
                        else{
                            $("#error").text("");
                            $("#error").html("");
                        // (function($) {
                        // $(function() {
                        var datasource = response;
                        var nodeTemplate = function(data) {
                            return `
                                <span class="office">${data.id}</span>
                                <div class="title">${data.name}</div>
                                <div class="content">${data.description}</div>
                                <div class="content">${data.email}</div>
                                <div class="content">${data.phoneNo}</div>
                                <div class="content">${data.roll}</div>
                                <div class="content">${data.rolldesc}</div>
                        `;
                        };
                        var oc = $('#chart-container').orgchart({
                            'data' : datasource,
                            'nodeTemplate': nodeTemplate
                        });
                        // })(jQuery);
                        //})(jQuery);
                    }
                        //document.getElementById('empid').value='';


                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });

                    $("#emplist").hide();
                    $("#emplist").empty();

                }

            });
            $("#locbtn").click(function(){

                var selectedvalue = $("#loclist").find("option:selected").text().trim();
                console.log("selectedvalue "+" , "+selectedvalue);
                if(selectedvalue == ""){
                    var value = document.getElementById('locid').value;
                }
                else{
                    var value = selectedvalue;
                }
                console.log(value)
                if(value == ""){
                    $('#chart-container1').empty();
                }
                else{
                    var orgchart = new Orgcharts({
                        locid: value
                    });
                    console.log("value is "+orgchart);
                    console.log(orgchart);
                    // Redirect after save
                    orgchart.$save(function (response) {
                        console.log("client controller redirect after save")
                        console.log("id is..");
                        console.log(response);
                       // console.log(response.children.length);
                      //  console.log(response.children[0].children.length);


                        $( "#chart-container1" ).empty();
                        $("#map_div").empty();
                        if((response.name === "" || response.name === undefined)){
                            var list = response.data1;
                            if((response.data1 == "")){
                               // alert("in undefined")
                                $("#locerror").text("invalid location id");
                                $("#locerror").html("invalid location id");
                            }
                            else{
                                $("#loclist").show();
                                var select = document.getElementById("loclist");
                                var options = list;
                                for(var i = 0; i < options.length; i++) {
                                    var opt = options[i];
                                    var loclist = document.createElement("option");
                                        loclist.textContent = opt;
                                        loclist.value = opt;
                                        select.appendChild(loclist);
                                    }
                                    $("#locerror").text("duplicate values exists select respective Id");
                                    $("#locerror").html("duplicate values exists select respective Id");
                            }
                        }
                        else{
                            $("#locerror").text("");
                            $("#locerror").html("");

                      var lat1 = response.position[0];
                        var long1 = response.position[1];
                              // (function($) {
                        // $(function() {
                        var datasource = response;
                        var nodeTemplate = function(data) {
                            return `
                                <span class="office">${data.name}</span>
                                <div class="title">${data.title}</div>
                                <div class="content">${data.description}</div>
                        `;
                        };
                        var oc = $('#chart-container1').orgchart({
                            'data' : datasource,
                            'nodeTemplate': nodeTemplate
                        });
                        // })(jQuery);
                        //})(jQuery);


                            /*
                         * declare map as a global variable
                         */
                        var map;

                        /*
                         * use google maps api built-in mechanism to attach dom events
                         */
                      //  google.maps.event.addDomListener(window, "load", function () {

                            var lat = response.position[0];
                            var long = response.position[1];
                            if(lat == "" && long == ""){
                                var lat = response.children[i].position[0];
                                var long = response.children[i].position[0];
                            }

                          /*
                           * create map
                           */
                            if(lat == null && long == null){
                                document.getElementById("map_div").innerHTML = "Location's latitude and longitude are not defined";
                            }
                            else{


                          var map = new google.maps.Map(document.getElementById("map_div"), {
                            center: new google.maps.LatLng(lat,long),
                            zoom: 8,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                          });
                            }
                          /*
                           * create infowindow (which will be used by markers)
                           */
                          var infoWindow = new google.maps.InfoWindow();

                          /*
                           * marker creater function (acts as a closure for html parameter)
                           */
                          function createMarker(options, html) {
                            var marker = new google.maps.Marker(options);
                            if (html) {
                              google.maps.event.addListener(marker, "click", function () {
                                infoWindow.setContent(html);
                                infoWindow.open(options.map, this);
                              });
                            }
                            return marker;
                          }

                          /*
                           * add markers to map
                           */
                          var marker0 = createMarker({
                            position: new google.maps.LatLng(lat1, long1),
                            map: map
                          },"<h3>" +response.name +":"+ response.title+"</h3>"+response.description);

                            for(var i=0; i<(response.children.length); i++){
                                var marker1 = createMarker({
                                    position: new google.maps.LatLng(response.children[i].position[0], response.children[i].position[1]),
                                    map: map,
                                    icon: response.children[i].icon
                                },"<h3>" +response.children[i].name +":"+ response.children[i].title+"</h3>"+response.children[i].description);
                            }
                            if(response.children[0].children != undefined){

                                for(var j=0; j<response.children[0].children.length; j++){
                                    console.log(response.children[0].children[j].position[0] + ", "+ response.children[0].children[j].position[1]);
                                    var marker2 = createMarker({
                                        position: new google.maps.LatLng(response.children[0].children[j].position[0], response.children[0].children[j].position[1]),
                                        map: map,
                                        icon: response.children[0].children[j].icon
                                    },"<h3>"+ response.children[0].children[j].name+":"+ response.children[0].children[j].title+"</h3>"+response.children[0].children[j].description);
                                }
                            }
                       // });



                    }
                        //document.getElementById('locid').value='';



                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                     $("#loclist").hide();
                        $("#loclist").empty();
                }
            });

        });
    };

    // Remove existing orgchart
    $scope.remove = function (orgchart) {
        console.log("client controller remove existing orgchart")
      if (orgchart) {
        orgchart.$remove();

        for (var i in $scope.orgcharts) {
          if ($scope.orgcharts[i] === orgchart) {
            $scope.orgcharts.splice(i, 1);
          }
        }
      } else {
        $scope.orgchart.$remove(function () {
          $location.path('orgcharts');
        });
      }
    };

    // Update existing orgchart
    $scope.update = function (isValid) {
     console.log("client controller update existing orgchart")

      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'orgchartForm');

        return false;
      }

      var orgchart = $scope.orgchart;

      orgchart.$update(function () {
        $location.path('orgcharts/' + orgchart._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of orgcharts
    $scope.find = function () {
      $scope.orgcharts = Orgcharts.query(function(result){
          //console.log($scope.orgcharts);
        /*console.log($scope.orgcharts[0].children[0].children);
        (function($) {
          $(function() {
              var ds = $scope.orgcharts[0];
           var ds = {
             'name': 'Lao Lao',
             'title': 'general manager',
             'children': [
               { 'name': 'Bo Miao', 'title': 'department manager' },
               { 'name': 'Su Miao', 'title': 'department manager',
                 'children': [
                   { 'name': 'Tie Hua', 'title': 'senior engineer' },
                   { 'name': 'Hei Hei', 'title': 'senior engineer',
                     'children': [
                       { 'name': 'Pang Pang', 'title': 'engineer' },
                       { 'name': 'Xiang Xiang', 'title': 'UE engineer' }
                     ]
                    }
                  ]
                },
                { 'name': 'Hong Miao', 'title': 'department manager' },
                { 'name': 'Chun Miao', 'title': 'department manager' }
              ]
               name: '1',
      children:
       [ { name: 'E13', title: 'asd' },
         { name: 'E16', title: 'Desc' },
         { name: 'E17', title: 'desc' } ]
            };

            var oc = $('#chart-container').orgchart({
              'data' : ds,
              'nodeContent': 'title',
              'draggable': true
            });

          });
        })(jQuery);*/
          /*
          $(function() {

    var datasource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'office': 'data1',
      'children': [
        { 'name': 'Bo Miao', 'title': 'department manager', 'office': 'data2' },
        { 'name': 'Su Miao', 'title': 'department manager', 'office': 'data3',
          'children': [
            { 'name': 'Tie Hua', 'title': 'senior engineer', 'office': 'data4' },
            { 'name': 'Hei Hei', 'title': 'senior engineer', 'office': 'data3' }
          ]
        },
        { 'name': 'Yu Jie', 'title': 'department manager', 'office': 'data5' },
        { 'name': 'Yu Li', 'title': 'department manager', 'office': 'data6' },
        { 'name': 'Hong Miao', 'title': 'department manager', 'office': 'data8' },
        { 'name': 'Yu Wei', 'title': 'department manager', 'office': 'data7' },
        { 'name': 'Chun Miao', 'title': 'department manager', 'office': 'data' },
        { 'name': 'Yu Tie', 'title': 'department manager', 'office': 'data9' }
      ]
    };

    var nodeTemplate = function(data) {
      return `
        <div class="content">${data.id}</div>
        <div class="title">${data.name}</div>
        <div class="content">${data.description}</div>
        <div class="content">${data.email}</div>
        <div class="content">${data.phoneNo}</div>
      `;
    };

    var oc = $('#chart-container').orgchart({
      'data' : datasource,
      'nodeTemplate': nodeTemplate
    });

  });
      */

      });
    };

    // Find existing orgchart
    $scope.findOne = function () {
      $scope.orgchart = Orgcharts.get({
        orgchartId: $stateParams.orgchartId
      });
    };
  }
]);

'use strict';

//orgcharts service used for communicating with the orgcharts REST endpoints
angular.module('orgcharts').factory('Orgcharts', ['$resource',
  function ($resource) {
    return $resource('api/orgcharts/:orgchartId', {
      orgchartId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the Reminders module
angular.module('reminders').run(['Menus',
  function (Menus) {
 /*   // Add the reminders dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Reminders',
      state: 'reminders',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'reminders', {
      title: 'List Reminders',
      state: 'reminders.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'reminders', {
      title: 'Create Reminders',
      state: 'reminders.create',
      roles: ['user']
    });*/
      
     
  }
]);

'use strict';

// Setting up route
angular.module('reminders').config(['$stateProvider',
  function ($stateProvider) {
    // reminders state routing
    $stateProvider
      .state('reminders', {
        abstract: true,
        url: '/reminders',
        template: '<ui-view/>'
      })
      .state('reminders.list', {
        url: '',
        templateUrl: 'modules/reminders/client/views/list-reminders.client.view.html'
      })
      .state('reminders.create', {
        url: '/create',
        templateUrl: 'modules/reminders/client/views/create-reminder.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('reminders.view', {
        url: '/:reminderId',
        templateUrl: 'modules/reminders/client/views/view-reminder.client.view.html'
      })
      .state('reminders.edit', {
        url: '/:reminderId/edit',
        templateUrl: 'modules/reminders/client/views/edit-reminder.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// reminders controller
angular.module('reminders').controller('RemindersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reminders',
  function ($scope, $stateParams, $location, Authentication, Reminders) {
    $scope.authentication = Authentication;

    // Create new Reminder
    $scope.create = function (isValid) {
        
        console.log("client reminder create controller")
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'reminderForm');
        console.log("true...")
        return false;
      }

      // Create new reminder object
          console.log("client controller create new reminder object")
      var reminder = new Reminders({
         
        title: this.title,
        content: this.content
      });
        console.log("value is "+reminder);
        for(var x in reminder){
            console.log(x[0]);
        }
      // Redirect after save
      reminder.$save(function (response) {
          console.log("client controller redirect after save")
        $location.path('reminders/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing reminder
    $scope.remove = function (reminder) {      
        console.log("client controller remove existing reminder")    
      if (reminder) {
        reminder.$remove();

        for (var i in $scope.reminders) {
          if ($scope.reminders[i] === reminder) {
            $scope.reminders.splice(i, 1);
          }
        }
      } else {
        $scope.reminder.$remove(function () {
          $location.path('reminders');
        });
      }
    };

    // Update existing reminder
    $scope.update = function (isValid) {
     console.log("client controller update existing reminder")

      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'reminderForm');

        return false;
      }

      var reminder = $scope.reminder;

      reminder.$update(function () {
        $location.path('reminders/' + reminder._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of reminders
    $scope.find = function () {
      $scope.reminders = Reminders.query();
    };

    // Find existing reminder
    $scope.findOne = function () {
      $scope.reminder = Reminders.get({
        reminderId: $stateParams.reminderId
      });
    };
  }
]);

'use strict';

//reminders service used for communicating with the reminders REST endpoints
angular.module('reminders').factory('Reminders', ['$resource',
  function ($resource) {
    return $resource('api/reminders/:reminderId', {
      reminderId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the reports module
angular.module('reports').run(['Menus',
  function (Menus) {
 /*// Add the reports dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Reports',
      state: 'reports',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'reports', {
      title: 'List Reports',
      state: 'reports.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'reports', {
      title: 'Create Reports',
      state: 'reports.create',
      roles: ['user']
    });*/
      
     
  }
]);

'use strict';

// Setting up route
angular.module('reports').config(['$stateProvider',
  function ($stateProvider) {
    // reports state routing
    $stateProvider
      .state('reports', {
        abstract: true,
        url: '/reports',
        template: '<ui-view/>'
      })
      .state('reports.list', {
        url: '',
        templateUrl: 'modules/reports/client/views/list-reports.client.view.html'
      })
      .state('reports.create', {
        url: '/create',
        templateUrl: 'modules/reports/client/views/create-report.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('reports.view', {
        url: '/:reportId',
        templateUrl: 'modules/reports/client/views/view-report.client.view.html'
      })
      .state('reports.edit', {
        url: '/:reportId/edit',
        templateUrl: 'modules/reports/client/views/edit-report.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// reports controller
angular.module('reports').controller('ReportsController', ['$scope','$timeout', '$stateParams', '$location', 'Authentication', 'Reports',
  function ($scope,$timeout, $stateParams, $location, Authentication, Reports) {
    $scope.authentication = Authentication;


    var userStatus = Authentication.user.status;

    if (userStatus == 'Enable') {
      $scope.userEnable = true;
    } else {
      $scope.userEnable = false;
    }

    var Text;
  var myBarChart;
        /*   new ResizeSensor(jQuery('#resizetbl'), function(){
        i++;
        console.log('content dimension changed '+i);
        init();
        pie();
    });*/

      $scope.initDataTable = function() {
          init();
          init1();
          init2();
      }

    function init() {


            //console.log("in initDataTables");
              $timeout(function() {
                  var rowCount = $(".example tr").length;
                 // console.log("Row count value is"+rowCount);
                  if (rowCount >= 0) {
                     //console.log("Entered into Sorting");
                  $('#example').dataTable().fnDestroy()
                       $('#example').dataTable( {
                            "order": [],
                            resposive:true,
                            autoWidth:false,
                            //scrollX:true,
                            dom: 'Bfrtip',
                            buttons: [
                                //'copy', 'csv', 'excel', 'pdf',
                               /* {
                                    extend: 'print',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'copy',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'csv',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'excel',
                                    exportOptions: {
                                        columns: ':visible',
                                    }
                                },
                                {
                                    extend: 'pdf',
                                    orientation: 'landscape',
                                    pageSize: 'LEGAL',
                                    theme: 'grid',
                                    exportOptions: {
                                       // columns: ':visible'
                                    }
                                },*/
                                'colvis'
                            ],
                             columnDefs: [ {
                                targets: [4,6,10,-2,-3], // -2 is reassign, -3 is notification
                                visible: false
                            } ]
                        } );
                       $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
                        var styles = {

                            background:"white"
                        };
                        $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);


                       $('#example').on( 'length.dt', function ( e, settings, len ) {
                            console.log( 'New page length: '+len );
                        } );


                  }
               }, 1200)
        }
       function init1() {


            //console.log("in initDataTables2");
              $timeout(function() {

                  var rowCount = $(".example1 tr").length;
                 // console.log("Row count value is"+rowCount);
                  if (rowCount >= 0) {
                     //console.log("Entered into Sorting");
                  $('#example1').dataTable().fnDestroy()
                       $('#example1').dataTable( {
                            "order": [],
                            resposive:true,
                            autoWidth:false,
                            //scrollX:true,
                            dom: 'Bfrtip',
                            buttons: [
                                //'copy', 'csv', 'excel', 'pdf',
                                /*{
                                    extend: 'print',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'copy',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'csv',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'excel',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'pdf',
                                    orientation: 'landscape',
                                    pageSize: 'LEGAL',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },*/
                                'colvis'
                            ],
                             columnDefs: [ {
                                //targets: [-2,-3], // -2 is reassign, -3 is notification
                                visible: false
                            } ]
                        } );
                       $("div#example1_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
                        var styles = {

                            background:"white"
                        };
                        $("div#example1_wrapper").find($(".dt-buttons")).find($("a")).css(styles);


                       $('#example1').on( 'length.dt', function ( e, settings, len ) {
                            console.log( 'New page length: '+len );
                        } );


                  }
               }, 900)
        }

      function init2() {


            //console.log("in initDataTables2");
              $timeout(function() {
                  var rowCount = $(".example2 tr").length;
                 // console.log("Row count value is"+rowCount);
                  if (rowCount >= 0) {
                     //console.log("Entered into Sorting");
                  $('#example2').dataTable().fnDestroy()
                       $('#example2').dataTable( {
                            "order": [],
                            resposive:true,
                            autoWidth:false,
                            //scrollX:true,
                            dom: 'Bfrtip',
                            buttons: [
                                //'copy', 'csv', 'excel', 'pdf',
                                /*{
                                    extend: 'print',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'copy',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'csv',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'excel',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'pdf',
                                    orientation: 'landscape',
                                    pageSize: 'LEGAL',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },*/
                                'colvis'
                            ],
                             columnDefs: [ {
                               // targets: [-2,-3,-8], // -2 is reassign, -3 is notification
                                visible: false
                            } ]
                        } );
                       $("div#example2_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
                        var styles = {

                            background:"white"
                        };
                        $("div#example2_wrapper").find($(".dt-buttons")).find($("a")).css(styles);


                       $('#example2').on( 'length.dt', function ( e, settings, len ) {
                            console.log( 'New page length: '+len );
                        } );


                  }
               }, 900)
        }

    function datatable_destroy()
        {
          //alert("destroy");
          $('#example').dataTable().fnDestroy();
          $('#example1').dataTable().fnDestroy();
          $('#example2').dataTable().fnDestroy();
        }

    // Create new filter
    $scope.create = function () {

        console.log("client filter create controller")

      $(document).ready(function(){
          $(".apply").click(function(){
              datatable_destroy();
              //alert("apply clicked ")
              $scope.dashboard = "";
              //alert(Text);
              if(Text == "Resource utilization"){
                  var apply1 = $scope.filter1("apply");
                  //var result = JSON.stringify(sent);
                  console.log("apply1 is ........");
                  console.log(apply1);

                  var filter = new Reports({
                      apply1
                  });
                  // -------------------------Redirect after save----------------------
              filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);


                  $scope.resource = response.filtered;
                  $scope.resourcevalue = response.resutil;
                  pie2($scope.resourcevalue);
                  console.log($scope.resource);

                  init1();
                  init2();

              }, function (errorResponse) {
                    console.log("error in .....")
                    $scope.error = errorResponse.data.message;
                });
              }

              else if(Text == "Manufacturer quality report"){
                  var apply2 = $scope.filter1("apply");
                  //var result = JSON.stringify(sent);
                  console.log("apply1 is ........");
                  console.log(apply1);

                  var filter = new Reports({
                      apply2
                  });
                  // -------------------------Redirect after save----------------------
              filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);


                  $scope.manufacturer = response.asset;
                  $scope.assetvalue1 = response.assetval.value1;
                  $scope.assetvalue2 = response.assetval.value2;
                  pie3($scope.assetvalue1,$scope.assetvalue2);
                  console.log($scope.resource);
                  init1();
                  init2();

              }, function (errorResponse) {
                    console.log("error in .....")
                    $scope.error = errorResponse.data.message;
                });

              }

              else{
                  var apply = $scope.filter1("apply");
                  console.log(apply);

                  var filter = new Reports({
                      apply
                  });
                   // -------------------------Redirect after save----------------------
              filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);

                  var dashboard = Object.keys(response.filter1).length;
                  var tablearr=[];
                  console.log(response.filter1);
                  console.log(Object.keys(response.filter1).length);
                  if(dashboard > 100){
                    var datalength = 100;
                  }
                  else{
                    var datalength = dashboard;
                  }
                  for(var x=0; x<datalength ; x++){
                    tablearr.push(response.filter1[x])
                  }
                  $scope.tabledata = tablearr;
                  $scope.dashboard = response.filter1;
                  console.log($scope.dashboard);


                    //console.log(response.result);
                    var data = response.result;
                    console.log(data);
                    $scope.open = data[0].open;
                    $scope.closed = data[0].closed;
                    $scope.inprogress = data[0].inprogress;
                    $scope.solved = data[0].solved;
                    $scope.total = data[0].total;

                    $scope.max = Math.max($scope.total);
                    $scope.pievalue = data[1];
                      console.log($scope.pievalue);

                    bar1($scope.open,$scope.closed,$scope.inprogress,$scope.solved,$scope.total);
                    pie1($scope.pievalue);

                  init();
                  init1();
                  init2();
                  pie();


              }, function (errorResponse) {
                    console.log("error in .....")
                    $scope.error = errorResponse.data.message;
                });
              }


          });



          $("#savehoverbutton").click(function(){
              datatable_destroy();
              //alert(Text);
              console.log("client filter create controller")
              var result = $scope.filter1("save");
              var name = $('#input').val();
              // Create new filter object
              console.log("client controller create new filter object")
              var save = new Reports({
                  reporttype:Text,
                  queryname: name,
                  filterquery: result
              });
              console.log("value is "+save);
              console.log(save)
              // Redirect after save
              save.$save(function (response) {
                  console.log("client controller redirect after save")
                  // $location.path('filters/' + response._id);
                  $scope.query=response.saved2;
                  $scope.filtername = response.saved1.queryname;
                  $scope.reportname = response.saved1.reporttype;
                  $scope.id = response.saved1._id;
                  console.log("query is...");
                  console.log($scope.reportname);
                  var str = response.saved1.filterquery;
                  for (let obj of str) {
                      obj["vendor.id"] = obj["vendor,id"];
                        delete obj["vendor,id"];
                        obj["escalation.level"] = obj["escalation,level"];
                        delete obj["escalation,level"];
                        obj["notification.time"] = obj["notification,time"];
                        delete obj["notification,time"];
                        obj["employee.name"] = obj["employee,name"];
                        delete obj["employee,name"];
                  }
                  console.log("str is..");
                  console.log(str);

                  if(Text == "Resource utilization"){

                      var apply1 = str;
                      console.log("apply is...");
                      console.log(apply);
                      var filter = new Reports({
                          apply1
                      });

        // -------------------------Redirect after save--------------
                  filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);


                  $scope.resource = response.filtered;
                  $scope.resourcevalue = response.resutil;
                  pie2($scope.resourcevalue);
                  console.log($scope.resource);
                  $("#myBtn").hide();
                  $(".abc").show();

                  }, function (errorResponse) {
                        console.log("error in .....")
                        $scope.error = errorResponse.data.message;
                    });

                  }
                  else if(Text == "Manufacturer quality report"){

                      var apply2 = str;
                      console.log("apply is...");
                      console.log(apply);
                      var filter = new Reports({
                          apply2
                      });

        // -------------------------Redirect after save--------------
                  filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);


                  $scope.manufacturer = response.asset;
                  $scope.assetvalue1 = response.assetval.value1;
                  $scope.assetvalue2 = response.assetval.value2;
                  pie3($scope.assetvalue1,$scope.assetvalue2);
                  console.log($scope.resource);
                  $("#myBtn").hide();
                  $(".abc").show();
                  }, function (errorResponse) {
                        console.log("error in .....")
                        $scope.error = errorResponse.data.message;
                    });

                  }

                  else{
                      var apply = str;
                      console.log("apply is...");
                      console.log(apply);
                      var filter = new Reports({
                          apply
                      });

        // -------------------------Redirect after save--------------
                  filter.$save(function (response) {
                      //filter.$query(function (response) {
                      console.log("client controller redirect after save")
                      //$location.path('filters/' + response._id);
                      console.log("response is.. " + response);
                      console.log(response.filter1);

                      var dashboard = Object.keys(response.filter1).length;
                      var tablearr=[];
                      console.log(response.filter1);
                      console.log(Object.keys(response.filter1).length);
                      if(dashboard > 100){
                        var datalength = 100;
                      }
                      else{
                        var datalength = dashboard;
                      }
                      for(var x=0; x<datalength ; x++){
                        tablearr.push(response.filter1[x])
                      }
                      $scope.tabledata = tablearr;
                      $scope.dashboard = response.filter1;
                      console.log(response.result);
                      var data = response.result;

                      $scope.open = data[0].open;
                      $scope.closed = data[0].closed;
                      $scope.inprogress = data[0].inprogress;
                      $scope.solved = data[0].solved;
                      $scope.total = data[0].total;

                      $scope.max = Math.max($scope.total);
                      $scope.pievalue = data[1];
                      console.log($scope.pievalue);
                      bar1($scope.open,$scope.closed,$scope.inprogress,$scope.solved,$scope.total);
                      pie1($scope.pievalue);
                      init();
                      pie();
                      $("#myBtn").hide();
                      $(".abc").show();

                  }, function (errorResponse) {
                        console.log("error in .....")
                        $scope.error = errorResponse.data.message;
                    });
                  }
          }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
          });



        });



     });
    };





    // Remove existing Filter
    $scope.remove = function (filter) {
        console.log("client controller remove existing report");
      if (filter) {
         // alert("in remove if condition");
        filter.$remove();

        for (var i in $scope.filters) {
          if ($scope.filters[i] === filter) {
            $scope.filters.splice(i, 1);
          }
        }
      } else {
          console.log("in remove else condition");
          console.log($scope.id);
           var remove = new Reports({
            _id:$scope.id
          });
        remove.$remove(function () {
            location.reload();
         // $location.path('filters');
        });
      }
    };



    // Update existing filter
    $scope.update = function () {
     console.log("client controller update existing filter");
        datatable_destroy();

        var name1 = $('#input').val();
        console.log($scope.id);
        var result1 = $scope.filter1("save");//new//
        console.log("result is ... ");
        console.log(result1);
        var filter = new Reports({
            _id:$scope.id,
            reporttype:Text,
            queryname: name1,
            filterquery: result1
          });

      //var filter = $scope.filter;
        console.log("filter is ...");
       console.log(filter);//old//new
      filter.$update(function (response) {
        //$location.path('filters/' + filter._id);
          console.log("update res..")
          console.log(response);
           $scope.filtername = response.update.queryname;
           $scope.reportname = response.updatelist.reporttype;
              console.log("query is...");
              console.log($scope.reportname);
              $scope.query = response.updatelist;
              var str = response.update.filterquery;

                for (let obj of str) {
                    obj["vendor.id"] = obj["vendor,id"];
                    delete obj["vendor,id"];
                    obj["escalation.level"] = obj["escalation,level"];
                    delete obj["escalation,level"];
                    obj["notification.time"] = obj["notification,time"];
                    delete obj["notification,time"];
                    obj["employee.name"] = obj["employee,name"];
                    delete obj["employee,name"];
                }

          if(Text == "Resource utilization"){

                      var apply1 = str;
                      console.log("apply is...");
                      console.log(apply);
                      var filter = new Reports({
                          apply1
                      });

        // -------------------------Redirect after save--------------
                  filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);


                  $scope.resource = response.filtered;
                  $scope.resourcevalue = response.resutil;
                  pie2($scope.resourcevalue);
                  console.log($scope.resource);
                  //$("#myBtn").hide();
                  //$(".abc").show();

                  }, function (errorResponse) {
                        console.log("error in .....")
                        $scope.error = errorResponse.data.message;
                    });

                  }
                  else if(Text == "Manufacturer quality report"){

                      var apply2 = str;
                      console.log("apply is...");
                      console.log(apply);
                      var filter = new Reports({
                          apply2
                      });

        // -------------------------Redirect after save--------------
                  filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);


                  $scope.manufacturer = response.asset;
                  $scope.assetvalue1 = response.assetval.value1;
                  $scope.assetvalue2 = response.assetval.value2;
                  pie3($scope.assetvalue1,$scope.assetvalue2);
                  console.log($scope.resource);
                  //$("#myBtn").hide();
                  //$(".abc").show();
                  }, function (errorResponse) {
                        console.log("error in .....")
                        $scope.error = errorResponse.data.message;
                    });

                  }
          else{
              var apply = str;
              console.log("apply is...");
              console.log(apply);
                var filter = new Reports({
                  apply
                //title: this.titl
                //content: this.content
              });

    // -------------------------Redirect after save--------------
              filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);
                  console.log(response.filter1);

                  var dashboard = Object.keys(response.filter1).length;
                  var tablearr=[];
                  console.log(response.filter1);
                  console.log(Object.keys(response.filter1).length);
                  if(dashboard > 100){
                    var datalength = 100;
                  }
                  else{
                    var datalength = dashboard;
                  }
                  for(var x=0; x<datalength ; x++){
                    tablearr.push(response.filter1[x])
                  }
                  $scope.tabledata = tablearr;
                  $scope.dashboard = response.filter1;
                  console.log(response.result);
                  var data = response.result;

                  $scope.open = data[0].open;
                  $scope.closed = data[0].closed;
                  $scope.inprogress = data[0].inprogress;
                  $scope.solved = data[0].solved;
                  $scope.total = data[0].total;

                  $scope.max = Math.max($scope.total);
                  $scope.pievalue = data[1];
                  console.log($scope.pievalue);
                  bar1($scope.open,$scope.closed,$scope.inprogress,$scope.solved,$scope.total);
                  pie1($scope.pievalue);
                  init();
                  pie();

              }, function (errorResponse) {
                    console.log("error in .....")
                    $scope.error = errorResponse.data.message;
                });

      }
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };



    // Find a list of Filters
    $scope.find = function () {
        $("#load").hide();
        $scope.filters = Reports.query(function(result){
          //alert($scope.filters.length);
          if($scope.filters.length == 1){
            location.reload();
          //  $location.path('authentication/signin');
          }
          else{

            $scope.addfilter = $scope.filters[1][0].addfilter;
            $scope.addfilter1 = $scope.filters[1][0].addfilter1;
            $scope.addfilter2 = $scope.filters[1][0].addfilter2;

            $scope.status = $scope.filters[3][0].first;
            $scope.statusSub = $scope.filters[3][0].second;

	  		$scope.ticketId=$scope.filters[0][0].ticketId;
            //console.log($scope.ticketId)
	  		    //$scope.ticketIdSub=$scope.filters[0][0].ticketId.second;

            $scope.assignedto=$scope.filters[0][0].assignedto;
	  		    //$scope.timeSub=$scope.filters[0][0].time.second;
            $scope.vendor=$scope.filters[0][0].vendor;

            $scope.shift = $scope.filters[0][0].shift.first;
            $scope.shiftSub = $scope.filters[0][0].shift.second;

            $scope.actual=$scope.filters[0][0].actual;
            $scope.expected=$scope.filters[0][0].expected;
		        $scope.tag=$scope.filters[0][0].tag;
            $scope.phoneNo=$scope.filters[0][0].phonenumber;
            $scope.complaint=$scope.filters[0][0].complaint;
            $scope.name=$scope.filters[0][0].name;
            //$scope.nameSub=$scope.filters[0][0].name.second;

            $scope.escalation=$scope.filters[0][0].escalation;
            //$scope.reassignSub=$scope.filters[0][0].reassign.second;

            $scope.notification=$scope.filters[0][0].notification;

            $scope.rating=$scope.filters[0][0].rating;

            $scope.employeeStatus=$scope.filters[0][0].employeeStatus.first;
            $scope.employeeStatusSub=$scope.filters[0][0].employeeStatus.second;

            $scope.employeeId=$scope.filters[0][0].employeeId;
            $scope.employeeEmail=$scope.filters[0][0].employeeEmail;
            $scope.employeeDescription=$scope.filters[0][0].employeeDescription;
            $scope.employeeMobile=$scope.filters[0][0].employeeMobile;

            $scope.manufacturerfilter=$scope.filters[0][0].manufacturer;
            $scope.assettype=$scope.filters[0][0].assetType;
            $scope.numberofissues=$scope.filters[0][0].numberOfIssues;

		        $scope.filterdetails=$scope.filters[0][0].date;

            $scope.query=$scope.filters[2];

            console.log($scope.query);

            // var dashboard = $scope.filters[4];
            var dashboard = Object.keys($scope.filters[4]).length;
            var tablearr=[];
            console.log($scope.filters[4]);
            console.log(Object.keys($scope.filters[4]).length);
            if(dashboard > 100){
              var datalength = 100;
            }
            else{
              var datalength = dashboard;
            }
            for(var x=0; x<datalength ; x++){
              tablearr.push($scope.filters[4][x])
            }
            $scope.tabledata = tablearr;
            $scope.dashboard = $scope.filters[4];

            console.log($scope.filters[5]);
            var data = $scope.filters[5];

            $scope.open = data[0].open;
            console.log("open is .. "+$scope.open);
            $scope.closed = data[0].closed;
            $scope.inprogress = data[0].inprogress;
            $scope.solved = data[0].solved;
            $scope.total = data[0].total;

            $scope.max = Math.max($scope.total);
            $scope.pievalue = data[1];
            var array =[];
            array.push("Expected"+":"+data[1][0]);
            array.push("Actual"+":"+data[1][1])
            console.log(array);
            bar1($scope.open,$scope.closed,$scope.inprogress,$scope.solved,$scope.total);
            pie1($scope.pievalue,array[0]);
            init();
            //console.log("dash is... ");
            //console.log($scope.dashboard);
            $scope.resource = $scope.filters[6];
            console.log("resource is....");
           // console.log($scope.resource);
            $scope.resourcevalue = $scope.filters[7][0].utilarray;

            //console.log($scope.resourcevalue);
            pie2($scope.resourcevalue);
            init1();
            $scope.manufacturer = $scope.filters[8];
            console.log($scope.manufacturer);
            $scope.assetvalue1 = $scope.filters[9].value1;
            console.log($scope.assetvalue1);
            $scope.assetvalue2 = $scope.filters[9].value2;
            console.log($scope.assetvalue2);
            init2();
            pie3($scope.assetvalue1,$scope.assetvalue2);
          }
          $(document).ready(function () {

            $(".spiner-example").hide();
            $("#load").show();
          });
        });

    };


         $scope.filter1 = function (string) {
            // alert("is.... "+string);

                var obj0={},obj=[],obj1={},obj2={},obj3={},obj4={},obj5={},obj6={},obj7={},obj8={},obj9={};
                var arr=[],table;

                if($('#cbSelection').is(":checked")){
                    var key = $('label[for="status"]').text().trim();
                    var data = $("#select1").find("option:selected").text().trim();
                    var data1 = $("#see").val().trim();
                }
                if($('#s2').is(":checked")){
                    var key1 = $('label[for="name"]').text().trim();
                    var data0 = $("#select2").find("option:selected").text().trim();
                    var data01 = $("#see1").val().trim();
                    //alert(data01);
                }
                 if($('#s02').is(":checked")){
                    var key01 = $('label[for="shift"]').text().trim();
                    var data00 = $("#select02").find("option:selected").text().trim();
                    var data001 = $("#see01").find("option:selected").text().trim();
                    //alert(data01);
                }
                if($('#s20').is(":checked")){
                    var key1 = $('label[for="actual"]').text().trim();
                    var data10 = $("#select20").find("option:selected").text().trim();
                    var data010 = $("#see10").val().trim();
                    var data0100 = $("#see100").val().trim();
                    //alert(data01);
                }
                if($('#s03').is(":checked")){
                    var key20 = $('label[for="expected"]').text().trim();
                   // alert(key2);
                    var data20 = $("#select003").find("option:selected").text().trim();
                    var data020 = $("#see02").val().trim();
                    var data0200 = $("#see002").val().trim();
                    //alert(data02);
                }
                if($('#s3').is(":checked")){
                    var key2 = $('label[for="ticketId"]').text().trim();
                   // alert(key2);
                    var data2 = $("#select03").find("option:selected").text().trim();
                    var data02 = $("#see2").val().trim();
                    //alert(data02);
                }
                if($('#s4').is(":checked")){
                    var key3 = $('label[for="complaint"]').text().trim();
                    var data3 = $("#select4").find("option:selected").text().trim();
                    var data03 = $("#see3").val().trim();
                }
                if($('#s04').is(":checked")){
                    var key30 = $('label[for="tag"]').text().trim();
                    var data30 = $("#select04").find("option:selected").text().trim();
                    var data030 = $("#see03").val().trim();
                }
                if($('#s004').is(":checked")){
                    var key300 = $('label[for="phone number"]').text().trim();
                    var data300 = $("#select004").find("option:selected").text().trim();
                    var data0300 = $("#see003").val().trim();
                }
                if($('#s5').is(":checked")){
                    var key4 = $('label[for="assignedto"]').text().trim();
                    var data4 = $("#select5").find("option:selected").text().trim();
                    var data04 = $("#see4").val().trim();
                }
                if($('#s05').is(":checked")){
                    var key_4 = $('label[for="vendorid"]').text().trim();
                    var data_4 = $("#select05").find("option:selected").text().trim();
                    //var data040 = $("#see040").find("option:selected").text().trim();
                    //alert(data040);
                    var data_04 = $("#see04").val().trim();
                    //alert("data_04 "+ data_04);
                }
                 if($('#s07').is(":checked")){
                    var key_7 = $('label[for="escalationlevel"]').text().trim();
                    var data_7 = $("#select07").find("option:selected").text().trim();
                    var data_07 = $("#see006").val().trim();
                }
                if($('#s005').is(":checked")){
                    var key_40 = $('label[for="notification"]').text().trim();
                    var data_40 = $("#select005").find("option:selected").text().trim();
                     //var data400 = $("#see0040").find("option:selected").text().trim();
                    var data_040 = $("#see004").val().trim();
                }
                if($('#s0005').is(":checked")){
                    var key_400 = $('label[for="rating"]').text().trim();
                    var data_400 = $("#select0005").find("option:selected").text().trim();
                    var data_0400 = $("#see0004").val().trim();
                    //alert(data_400+","+data_0400);
                }
                if($('#s6').is(":checked")){
                    var key5 = $('label[for="create"]').text().trim();

                    var data5 = $("#select6").val().trim();
                    //alert("data5 is"+data5);
                    var data05 = $("#see5").val().trim();
                    var data50 = $("#see50").val().trim();
                    //alert("data05 is"+data05);
                    var data005 = $("#see05").val().trim();
                }
                if($('#s7').is(":checked")){
                    var key6 = $('label[for="update"]').text().trim();
                    var data6 = $("#select7").val().trim();
                    var data06 = $("#see6").val().trim();
                    var data60 = $("#see60").val().trim();
                    var data006 = $("#see06").val().trim();
                }
                if($('#s8').is(":checked")){
                    var key7 = $('label[for="closed"]').text().trim();
                    var data7 = $("#select8").val().trim();
                    var data07 = $("#see7").val().trim();
                    var data70 = $("#see70").val().trim();
                    var data007 = $("#see07").val().trim();
                }

               if($('#cbSelection1').is(":checked")){
                    var empkey = $('label[for="employeestatus"]').text().trim();
                    var empdata = $("#select11").find("option:selected").text().trim();
                    var empdata0 = $("#see11").val().trim();
                }

                if($('#s12').is(":checked")){
                    var empkey1 = $('label[for="employeeid"]').text().trim();
                    var empdata1 = $("#select12").find("option:selected").text().trim();
                    var empdata01 = $("#see12").val().trim();
                    //alert(data01);
                }
                 if($('#s13').is(":checked")){
                    var empkey2 = $('label[for="employeeemail"]').text().trim();
                    var empdata2 = $("#select13").find("option:selected").text().trim();
                    var empdata02 = $("#see13").val().trim();
                    //alert(data01);
                }
                if($('#s14').is(":checked")){
                    var empkey3 = $('label[for="employeedesc"]').text().trim();
                    var empdata3 = $("#select14").find("option:selected").text().trim();
                    var empdata03 = $("#see14").val().trim();
                    //alert(data01);
                }
                if($('#s15').is(":checked")){
                    var empkey4 = $('label[for="employeemobile"]').text().trim();
                    var empdata4 = $("#select15").find("option:selected").text().trim();
                    var empdata04 = $("#see15").val().trim();
                }
                 if($('#s16').is(":checked")){
                    var empkey5 = $('label[for="createdate"]').text().trim();
                    var empdata5 = $("#select16").val().trim();
                    var empdata05 = $("#see016").val().trim();
                    var empdata50 = $("#see16").val().trim();
                    var empdata005 = $("#see160").val().trim();
                }

                if($('#cbSelection2').is(":checked")){
                    var assetkey = $('label[for="manufacturer"]').text().trim();
                    var assetdata = $("#select21").find("option:selected").text().trim();
                    var assetdata0 = $("#see21").val().trim();
                }

                if($('#s22').is(":checked")){
                    var assetkey1 = $('label[for="assettype"]').text().trim();
                    var assetdata1 = $("#select22").find("option:selected").text().trim();
                    var assetdata01 = $("#see22").val().trim();
                    //alert(data01);
                }
                 if($('#s23').is(":checked")){
                    var assetkey1 = $('label[for="numberissues"]').text().trim();
                    var assetdata10 = $("#select23").find("option:selected").text().trim();
                    var assetdata010 = $("#see23").val().trim();
                    var assetdata0100 = $("#see230").val().trim();
                }


                obj.push(data);
                if(obj[0] != undefined){
                  //alert(data1);
                  if(data1 != ""){
                    obj.push(data1);
                    arr.push({status: obj });
                      // alert("obj[1]"+arr);
                    }
                    else{
                      console.log("nothing selected");
                    //  alert("Select from the second dropdown");
                    }
                  }

        //creator name -------------------
                obj=[];
                obj.push(data0);
                if(obj[0] != undefined){
                  if(data01 == ""){
                    console.log("not selected ");
                  //  alert("Text feild is empty input a name");
                  }
                  else{
                    obj.push(data01);
                    console.log(obj);
                      arr.push({ name: obj });
                  }
                }
        //ticketId------------------------
                obj=[];
                obj.push(data2);
                if(obj[0] != undefined){
                  if(data2 == ""){
                    //alert("Text feild is empty input ticketid");
                  }
                  else{
                    obj.push(data02);
                    //obj2[key2]=obj;
                    arr.push({ ticketId: obj });
                  }
                }
                //actual -------------------
                        obj=[];
                        obj.push(data10);
                        if(obj[0] != undefined){
                          //alert(data010);
                          if(data010 == ""){
                            //alert("First field cant be empty");
                          }
                          else{
                            obj.push(data010);
                                if(data0100 == ""){
                                  //alert("Date second feild is empty");
                                }
                                  else{
                                    obj.push(data0100);
                                  }


                            arr.push({ actual_hrs: obj });
                          }

                       }
                //expected------------------------
                        obj=[];
                        obj.push(data20);
                        if(obj[0] != undefined){
                          //alert(data020);
                          if(data020 == ""){
                            //alert("First field cant be empty");
                          }
                          else{
                            obj.push(data020);
                                if(data0200 == ""){
                                  //alert("Date second feild is empty");
                                }
                                  else{
                                    obj.push(data0200);
                                  }
                                  arr.push({expected_hrs: obj });
                                  }
                                }
       //complaint--------------------------
                obj=[];

                obj.push(data3);
                 if(obj[0] != undefined){
                   if(data03 == ""){
                     //alert()
                   }
                   else{
                     obj.push(data03);
                     //obj3[key3]=obj;
                     arr.push({ complaint: obj });
                   }

                }
     //tag id--------------------------
                obj=[];

                obj.push(data30);
                 if(obj[0] != undefined){
                   if(data030 == ""){
                    // alert("");
                   }
                   else{
                     obj.push(data030);
                     //obj3[key3]=obj;
                     arr.push({ tagid: obj });
                   }

                }
     //phone number--------------------------
                obj=[];

                obj.push(data300);
                 if(obj[0] != undefined){
                   if(data0300 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data0300);
                     //obj3[key3]=obj;
                     arr.push({ phonenumber: obj });
                   }

                }

    //tickets in shifts-------------------
                   obj=[];

                obj.push(data00);
                if(obj[0] != undefined){
                  if(data001 == ""){
                    //alert("");
                  }
                  else{
                    obj.push(data001);
                    arr.push({ shift: obj });
                  }

               }

        if(string == "apply"){
    //assigned to-------------------------
                obj=[];

                obj.push(data4);
                 if(obj[0] != undefined){
                   if(data04 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data04);
                     //obj4[key4]=obj;
                     arr.push({ 'employee.name': obj });
                   }

                }
    //vendor id-------------------------
                obj=[];

                obj.push(data_4);
                 if(obj[0] != undefined){
                   if(data_04 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data_04);
                     arr.push({ 'vendor.id': obj });
                   }
                }
    //escalation level-------------------------
                obj=[];

                obj.push(data_7);
                 if(obj[0] != undefined){
                   if(data_07 == ""){
                     //alert("");
                   }
                   else{
                    obj.push(data_07);
                    arr.push({ 'problem.escalationlevel': obj });
                   }
                }
     //notification-------------------------
                obj=[];

                obj.push(data_40);
                 if(obj[0] != undefined){
                obj.push(data_040);
                arr.push({ 'problem.notification': obj });

                }

             }
             else{
    //assigned to-------------------------
                obj=[];

                obj.push(data4);
                 if(obj[0] != undefined){
                   if(data04 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data04);
                     //obj4[key4]=obj;
                     arr.push({ 'employee,name': obj });
                   }

                }
    //vendor id-------------------------
                obj=[];

                obj.push(data_4);
                 if(obj[0] != undefined){
                   if(data_04 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data_04);
                     arr.push({ 'vendor,id': obj });
                   }
                }
    //escalation level-------------------------
                obj=[];

                obj.push(data_7);
                 if(obj[0] != undefined){
                   if(data_07 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data_07);
                     arr.push({ 'problem,escalationlevel': obj });
                   }
                }
     //notification-------------------------
                obj=[];

                obj.push(data_40);
                 if(obj[0] != undefined){
                   if(data_040 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data_040);
                     arr.push({ 'problem,notification': obj });
                   }

                }

             }
    //rating--------------------------------
                obj=[];

                obj.push(data_400);
                 if(obj[0] != undefined){
                   if(data_0400 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(data_0400);
                     //obj4[key4]=obj;
                     arr.push({ rating: obj });
                   }
                }
                //created----------------------------
                            obj=[];
                        // alert(data5);
                            obj.push(data5);
                            if(obj[0] != undefined){

                                 if(data5 == "is" || data5 == "<=" || data5 == ">=" || data5 == "between"){
                                   console.log("the condition was true");
                                   var data50 = "";
                                   }
                                   else if(data5 == "more than days ago" || data5 == "less than days ago" || data5 == "in the past" || data5 == "days ago"){
                                     var data05 = "";
                                   }
                                   else{
                                     var data05 = "";
                                     var data50 = "";
                                   }
                                   if(data05 != "" || data50 != ""){
                                     if(data50 != ""){
                                       console.log("data50 != null true" + data50);
                                       obj.push(data50);
                                       arr.push({date:{created_time:obj}});
                                     }
                                     else if(data05 != ""){
                                         console.log("data05 != null true");
                                         if(obj == "between"){
                                           obj.push(data05);
                                           obj.push(data005);
                                           arr.push({date:{created_time:obj}});
                                         }
                                         else{
                                           obj.push(data05);
                                           console.log("here");
                                           arr.push({date:{created_time:obj}});
                                         }
                                       }
                                     }
                                     else{
                                       arr.push({date:{created_time:obj}});
                                       }
                                      }

                     //updated----------------------------
                            obj=[];
                        // alert(data6);
                            obj.push(data6);
                            if(obj[0] != undefined){
                                //alert(data6);
                                if(data6 == "is" || data6 == "<=" || data6 == ">=" || data6 == "between"){
                                  console.log("the condition was true");
                                  var data60 = "";
                                  }
                                  else if(data6 == "more than days ago" || data6 == "less than days ago" || data6 == "in the past" || data6 == "days ago"){
                                    var data06 = "";
                                  }
                                  else{
                                    var data06 = "";
                                    var data60 = "";
                                  }
                                if(data06 != "" || data60 != ""){

                                    if(data60 != ""){
                                        console.log("data60 != null true" + data60);
                                        obj.push(data60);
                                        arr.push({date:{updated_time:obj}});
                                    }
                                    else if(data06 != ""){
                                        console.log("data06 != null true");
                                        if(obj == "between"){
                                            obj.push(data06);
                                            obj.push(data006);
                                            arr.push({date:{updated_time:obj}});
                                        }
                                        else{
                                            obj.push(data06);
                                            console.log("here");
                                            arr.push({date:{updated_time:obj}});
                                        }

                                    }
                                }
                                else{
                             arr.push({date:{updated_time:obj}});
                         }
                            }

                   //closed date-----------------------------
                             obj=[];
                        // alert(data7);
                            obj.push(data7);
                            if(obj[0] != undefined){
                                //alert(data7);
                                if(data7 == "is" || data7 == "<=" || data7 == ">=" || data7 == "between"){
                                  console.log("the condition was true");
                                  var data70 = "";
                                  }
                                  else if(data7 == "more than days ago" || data7 == "less than days ago" || data7 == "in the past" || data7 == "days ago"){
                                    var data07 = "";
                                  }
                                  else{
                                    var data07 = "";
                                    var data70 = "";
                                  }
                                if(data07 != "" || data70 != ""){

                                    if(data70 != ""){
                                        console.log("data70 != null true" + data70);
                                        obj.push(data70);
                                        arr.push({date:{closed_time:obj}});
                                    }
                                    else if(data07 != ""){
                                        console.log("data07 != null true");
                                        if(obj == "between"){
                                            obj.push(data07);
                                            obj.push(data007);
                                            arr.push({date:{closed_time:obj}});
                                        }
                                        else{
                                            obj.push(data07);
                                            console.log("here");
                                            arr.push({date:{closed_time:obj}});
                                        }

                                    }
                                }
                                else{
                             arr.push({date:{closed_time:obj}});
                         }
                            }
          //employee status-------------------
                   obj=[];

                obj.push(empdata);
                if(obj[0] != undefined){

                if(empdata0 == ""){
                  //alert();
                }
                else{
                  console.log(obj);
                  obj.push(empdata0);
                  arr.push({'employeeStatus': obj });
                }
               }
        //employee Id------------------------
                    obj=[];

                obj.push(empdata1);
                 if(obj[0] != undefined){
                   if(empdata01 == ""){
                     //alert();
                   }
                   else{
                     obj.push(empdata01);
                     //obj2[key2]=obj;
                     arr.push({'employeeId': obj });
                   }

                }
        //employee email-------------------
                   obj=[];

                obj.push(empdata2);
                 if(obj[0] != undefined){
                   if(empdata02 == ""){
                     //alert();
                   }
                   else{
                     obj.push(empdata02);
                     //obj2[key2]=obj;
                     arr.push({'employeeEmail': obj });
                   }

               }
        //employee description------------------------
                    obj=[];

                obj.push(empdata3);
                 if(obj[0] != undefined){
                   if(empdata03 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(empdata03);
                     //obj2[key2]=obj;
                     arr.push({'employeeDesc': obj });
                   }

                }
        //employee mobile------------------------------
                   obj=[];

                obj.push(empdata4);
                 if(obj[0] != undefined){
                   if(empdata04 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(empdata04);
                     //obj2[key2]=obj;
                     arr.push({'employeeMobile': obj });
                   }

               }
     //employee created date----------------------------
                obj=[];
                obj.push(empdata5);
                if(obj[0] != undefined){
                    alert(obj);
                    if(empdata05 != "" || empdata50 != ""){
                        if(empdata5 == "is" || empdata5 == "<=" || empdata5 == ">=" || empdata5 == "between" || empdata5 == "more than days ago" || empdata5 == "less than days ago" || empdata5 == "in the past" || empdata50 == "days ago"){
                                console.log("true");
                            }
                        else{
                            var empdata05 = "";
                        }
                        if(empdata50 != ""){

                            obj.push(empdata50);
                            arr.push({date:{createdDate:obj}});
                        }
                        else if(empdata05 != ""){
                            if(obj == "between"){
                                obj.push(empdata05);
                                obj.push(empdata005);
                                arr.push({date:{createdDate:obj}});
                            }
                            else{
                                obj.push(empdata05);
                                arr.push({date:{createdDate:obj}});
                            }
                        }
                    }
                    else{
                         arr.push({date:{createdDate:obj}});
                     }
                }




        //manufacturer-------------------
                   obj=[];

                obj.push(assetdata);
                if(obj[0] != undefined){
                  if(assetdata0 == ""){
                    //alert("");
                  }
                  else{
                    obj.push(assetdata0);
                    console.log(obj);
                    arr.push({'manufacturer': obj });
                  }

               }
        //asset type------------------------
                    obj=[];

                obj.push(assetdata1);
                 if(obj[0] != undefined){
                   if(assetdata01 == ""){
                     //alert("");
                   }
                   else{
                     obj.push(assetdata01);
                     //obj2[key2]=obj;
                     arr.push({'assetType': obj });
                   }

                }
        //number of issues-------------------
                   obj=[];

                obj.push(assetdata10);
                if(obj[0] != undefined){
                  if(assetdata010 == ""){
                    //alert("");
                  }
                  else{
                    obj.push(assetdata010);
                        if(assetdata0100 != ""){
                          obj.push(assetdata0100);
                          arr.push({ numberOfIssues: obj });
                        }

                  }

               }
              console.log("arr is : "+arr);
             console.log(arr);
                return arr;

        }

      $scope.generate = function() {
          if(Text == "Shift time reports"){
              var columns = [
                    {title:"Tickets id", dataKey: "Tickets id"},
                    {title:"Status", dataKey: "Status"},
                    {title:"Tickets in shifts", dataKey: "Tickets in shifts"},
                    {title:"Assigned to", dataKey: "Assigned to"},
                    {title:"Tag", dataKey: "Tag"},
                    {title:"Complaint", dataKey: "Complaint"},
                    {title:"Name", dataKey: "Name"},
                    {title:"Phone number", dataKey: "Phone number"},
                    {title:"Created date", dataKey: "Created date"},
                    {title:"Updated date", dataKey: "Updated date"},
                    {title:"Closed date", dataKey: "Closed date"},
                    {title:"Actual time(hrs)", dataKey: "Actual time"},
                    {title:"Expected time(hrs)", dataKey: "Expected time"},
                    {title:"Vendor id", dataKey: "Vendor id"},
                    {title: "Escalation level", dataKey: "Escalation level" },
                    {title: "Notification", dataKey: "Notification" },
                    {title: "Ratings", dataKey: "Ratings" }
                ];

              var rows = [];
              var tbldata = $scope.dashboard;
              console.log(Object.keys(tbldata).length);
              for(var x=0; x<Object.keys(tbldata).length; x++){

                   if($scope.dashboard[x].created_time == null){
                  var datevalue = "null";
                  }
                  else{
                      var datevalue = (($scope.dashboard[x].created_time).replace(/T/, ' ').replace(/\..+/, '').slice(0,-3))
                  }
                  if($scope.dashboard[x].updated_time == null){
                      var datevalue01 = "null";
                  }
                  else{
                      var datevalue01 = (($scope.dashboard[x].updated_time).replace(/T/, ' ').replace(/\..+/, '').slice(0,-3))
                  }
                  if($scope.dashboard[x].closed_time == null){
                      var datevalue1 = "null";
                  }
                  else{
                      var datevalue1 = (($scope.dashboard[x].closed_time).replace(/T/, ' ').replace(/\..+/, '').slice(0,-3))
                  }

                  rows[x] = { 'Tickets id': $scope.dashboard[x].ticketId ,
                             Status: $scope.dashboard[x].status,
                             'Tickets in shifts': $scope.dashboard[x].shift,
                             'Assigned to': $scope.dashboard[x].employee.name,
                             'Tag':$scope.dashboard[x].tagid,
                             'Complaint':$scope.dashboard[x].complaint,
                             'Name':$scope.dashboard[x].name,
                             'Phone number':$scope.dashboard[x].phonenumber,
                             'Created date':datevalue,
                             'Updated date':datevalue01,
                             'Closed date':datevalue1,
                             'Actual time':$scope.dashboard[x].actual_hrs,
                             'Expected time':$scope.dashboard[x].expected_hrs,
                             'Vendor id':($scope.dashboard[x].vendor.id),
                             'Escalation level':$scope.dashboard[x].problem.escalationlevel,
                             'Notification':$scope.dashboard[x].problem.notification,
                             'Ratings':$scope.dashboard[x].rating
                            }
              }
              console.log(rows);

              var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth()+1; //January is 0!
                    var yyyy = today.getFullYear();
                    if(dd<10){
                      dd='0'+dd;
                    }
                    if(mm<10){
                     mm='0'+mm;
                       }
                    var today = dd+'/'+mm+'/'+yyyy;
                       console.log(today);

              var pdfsize = 'a0';
              var doc = new jsPDF('l', 'pt', pdfsize);


               var canvas = document.querySelector('#Chart');
                //creates image
                var canvasImg = canvas.toDataURL("image/jpeg");

                //creates PDF from img
                //var doc = new jsPDF('landscape');
                doc.setFontSize(50);
                doc.setFillColor(0,0,0,0);
                doc.rect(10, 10, 150, 160, "F");
                doc.text(30, 90, Text);
                doc.text(30, 200, "Chart");
                doc.text(30, 150, today);
                doc.addImage(canvasImg, 'JPEG',30,300,2000, 1050 );// wxh


              //var res = doc.autoTableHtmlToJson(document.getElementById("example"),false);
              doc.setFontSize(50);
              doc.addPage();//for new page...
              doc.autoTable(columns,rows, {
                startY: 200,
                theme: 'grid',
                styles: {
                  overflow: 'linebreak',
                  fontSize: 30,
                 // rowHeight: 60,
                  //cellPadding:20,
                 // columnWidth: 'wrap'
                },
                columnStyles: {
                  //1: {columnWidth: 'auto'}
                  columnWidth: 100
                },
                addPageContent: function(data) {
                        doc.text("Table\n",30,150);
                    }
              });



              doc.save("table.pdf");
          }

          if(Text == "Employee efficiency report"){
              var columns = [
                    {title:"Tickets id", dataKey: "Tickets id"},
                    {title:"Status", dataKey: "Status"},
                    {title:"Tickets in shifts", dataKey: "Tickets in shifts"},
                    {title:"Assigned to", dataKey: "Assigned to"},
                    {title:"Tag", dataKey: "Tag"},
                    {title:"Complaint", dataKey: "Complaint"},
                    {title:"Name", dataKey: "Name"},
                    {title:"Phone number", dataKey: "Phone number"},
                    {title:"Created date", dataKey: "Created date"},
                    {title:"Updated date", dataKey: "Updated date"},
                    {title:"Closed date", dataKey: "Closed date"},
                    {title:"Actual time(hrs)", dataKey: "Actual time"},
                    {title:"Expected time(hrs)", dataKey: "Expected time"},
                    {title:"Vendor id", dataKey: "Vendor id"},
                    {title: "Escalation level", dataKey: "Escalation level" },
                    {title: "Notification", dataKey: "Notification" },
                    {title: "Ratings", dataKey: "Ratings" }
                ];

              var rows = [];
              var tbldata = $scope.dashboard;
              console.log(Object.keys(tbldata).length);
              for(var x=0; x<Object.keys(tbldata).length; x++){

                  if($scope.dashboard[x].created_time == null){
                  var datevalue = "null";
                  }
                  else{
                      var datevalue = (($scope.dashboard[x].created_time).replace(/T/, ' ').replace(/\..+/, '').slice(0,-3))
                  }
                  if($scope.dashboard[x].updated_time == null){
                      var datevalue01 = "null";
                  }
                  else{
                      var datevalue01 = (($scope.dashboard[x].updated_time).replace(/T/, ' ').replace(/\..+/, '').slice(0,-3))
                  }
                  if($scope.dashboard[x].closed_time == null){
                      var datevalue1 = "null";
                  }
                  else{
                      var datevalue1 = (($scope.dashboard[x].closed_time).replace(/T/, ' ').replace(/\..+/, '').slice(0,-3))
                  }

                  rows[x] = { 'Tickets id': $scope.dashboard[x].ticketId ,
                             Status: $scope.dashboard[x].status,
                             'Tickets in shifts': $scope.dashboard[x].shift,
                             'Assigned to': $scope.dashboard[x].employee.name,
                             'Tag':$scope.dashboard[x].tagid,
                             'Complaint':$scope.dashboard[x].complaint,
                             'Name':$scope.dashboard[x].name,
                             'Phone number':$scope.dashboard[x].phonenumber,
                             'Created date':datevalue,
                             'Updated date':datevalue01,
                             'Closed date':datevalue1,
                             'Actual time':$scope.dashboard[x].actual_hrs,
                             'Expected time':$scope.dashboard[x].expected_hrs,
                             'Vendor id':($scope.dashboard[x].vendor.id),
                             'Escalation level':$scope.dashboard[x].escalation.level,
                             'Notification':$scope.dashboard[x].notification.time,
                             'Ratings':$scope.dashboard[x].rating
                            }
              }
              console.log(rows);

              var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth()+1; //January is 0!
                    var yyyy = today.getFullYear();
                    if(dd<10){
                      dd='0'+dd;
                    }
                    if(mm<10){
                     mm='0'+mm;
                       }
                    var today = dd+'/'+mm+'/'+yyyy;
                       console.log(today);

              var pdfsize = 'a0';
              var doc = new jsPDF('l', 'pt', pdfsize);


               var canvas = document.querySelector('#pieChart');
                //creates image
                var canvasImg = canvas.toDataURL("image/jpeg");

                //creates PDF from img
                //var doc = new jsPDF('landscape');
                doc.setFontSize(50);
                doc.setFillColor(0,0,0,0);
                doc.rect(10, 10, 150, 160, "F");
                doc.text(30, 90, Text);
                doc.text(30, 200, "Chart");
                doc.text(30, 150, today);
                doc.addImage(canvasImg, 'JPEG',30,300,2000, 1050 );// wxh


              //var res = doc.autoTableHtmlToJson(document.getElementById("example"),false);
              doc.setFontSize(50);
              doc.addPage();
              doc.autoTable(columns,rows, {
                startY: 300,
                theme: 'grid',
                styles: {
                  overflow: 'linebreak',
                  fontSize: 30,
                 // rowHeight: 60,
                  //cellPadding:20,
                 // columnWidth: 'wrap'
                },
                columnStyles: {
                  //1: {columnWidth: 'auto'}
                  columnWidth: 100
                },
                addPageContent: function(data) {
                        doc.text("Table",30,140);
                    }
              });



              doc.save("table.pdf");
          }

          if(Text == "Resource utilization"){
              var columns = [
                    {title:"Employee id", dataKey: "Employee id"},
                    {title:"Employee status", dataKey: "Employee status"},
                    {title:"Employee email", dataKey: "Employee email"},
                    {title:"Employee mobile", dataKey: "Employee mobile"},
                    {title:"Employee description", dataKey: "Employee description"},
                    {title:"Created date", dataKey: "Created date"}
                ];


              var rows = [];
              var tblutil = $scope.resource;
              console.log(Object.keys(tblutil).length);
              for(var x=0; x<Object.keys(tblutil).length; x++){

                  rows[x] = { 'Employee id': $scope.resource[x].employeeId ,
                             'Employee status': $scope.resource[x].employeeStatus,
                             'Employee email': $scope.resource[x].employeeEmail,
                             'Employee mobile':$scope.resource[x].employeeMobile,
                             'Employee description':$scope.resource[x].employeeDesc,
                             'Created date':(($scope.resource[x].createdDate))
                             //'Created date':(($scope.resource[x].createdDate).replace(/T/, ' ').replace(/\..+/, '').slice(0,-3))
                            }
              }
              console.log(rows);

              var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth()+1; //January is 0!
                    var yyyy = today.getFullYear();
                    if(dd<10){
                      dd='0'+dd;
                    }
                    if(mm<10){
                     mm='0'+mm;
                       }
                    var today = dd+'/'+mm+'/'+yyyy;
                       console.log(today);

              var pdfsize = 'a0';
              var doc = new jsPDF('l', 'pt', pdfsize);


               var canvas = document.querySelector('#piechart');
                //creates image
                var canvasImg = canvas.toDataURL("image/jpeg");

                //creates PDF from img
                //var doc = new jsPDF('landscape');
                doc.setFontSize(50);
                doc.setFillColor(0,0,0,0);
                doc.rect(10, 10, 150, 160, "F");
                doc.text(30, 90, Text);
                doc.text(30, 200, "Chart");
                doc.text(30, 150, today);
                doc.addImage(canvasImg, 'JPEG',30,300,2000, 1050 );// wxh


              //var res = doc.autoTableHtmlToJson(document.getElementById("example"),false);
              doc.setFontSize(50);
              doc.addPage();
              doc.autoTable(columns,rows, {
                startY: 300,
                theme: 'grid',
                styles: {
                  overflow: 'linebreak',
                  fontSize: 30,
                 // rowHeight: 60,
                  //cellPadding:20,
                 // columnWidth: 'wrap'
                },
                columnStyles: {
                  //1: {columnWidth: 'auto'}
                  columnWidth: 100
                },
                addPageContent: function(data) {
                        doc.text("Table",30,140);
                    }
              });



              doc.save("table.pdf");
          }

          if(Text == "Manufacturer quality report"){
              var columns = [
                    {title:"Manufacturer", dataKey: "Manufacturer"},
                    {title:"Asset type", dataKey: "Asset type"},
                    {title:"Number of issues", dataKey: "Number of issues"}
                ];


              var rows = [];
              var tblutil = $scope.manufacturer;
              console.log(Object.keys(tblutil).length);
              for(var x=0; x<Object.keys(tblutil).length; x++){

                  rows[x] = { 'Manufacturer': $scope.manufacturer[x].manufacturer ,
                             'Asset type': $scope.manufacturer[x].assetType,
                             'Number of issues': $scope.manufacturer[x].numberOfIssues
                            }
              }
              console.log(rows);

              var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth()+1; //January is 0!
                    var yyyy = today.getFullYear();
                    if(dd<10){
                      dd='0'+dd;
                    }
                    if(mm<10){
                     mm='0'+mm;
                       }
                    var today = dd+'/'+mm+'/'+yyyy;
                       console.log(today);

              var pdfsize = 'a0';
              var doc = new jsPDF('l', 'pt', pdfsize);


               var canvas = document.querySelector('#assetpiechart');
                //creates image
                var canvasImg = canvas.toDataURL("image/jpeg");

                //creates PDF from img
                //var doc = new jsPDF('landscape');
                doc.setFontSize(50);
                doc.setFillColor(0,0,0,0);
                doc.rect(10, 10, 150, 160, "F");
                doc.text(30, 90, Text);
                doc.text(30, 200, "Chart");
                doc.text(30, 150, today);
                doc.addImage(canvasImg, 'JPEG',30,300,2000, 1050 );// wxh


              //var res = doc.autoTableHtmlToJson(document.getElementById("example"),false);
              doc.setFontSize(50);
              doc.addPage();
              doc.autoTable(columns,rows, {
                startY: 300,
                theme: 'grid',
                styles: {
                  overflow: 'linebreak',
                  fontSize: 30,
                 // rowHeight: 60,
                  //cellPadding:20,
                 // columnWidth: 'wrap'
                },
                columnStyles: {
                  //1: {columnWidth: 'auto'}
                  columnWidth: 100
                },
                addPageContent: function(data) {
                        doc.text("Table",30,140);
                    }
              });



              doc.save("table.pdf");
          }

        }


       $scope.excel = function() {
          // alert("selected");
         $("#example").table2excel({
                 exclude: ".noExl",
                 name: "Excel Document Name",
         filename: "file_name",
         fileext: ".xls",
         exclude_img: true,
         exclude_links: true,
         exclude_inputs: true
         });
       }


      function pie1(value,value2){
        var pieChartContent = document.getElementById('pieChartContent');
        if(pieChartContent != null){
          pieChartContent.innerHTML = '&nbsp;';
          $('#pieChartContent').append('<canvas id="pieChart" class="pieChart" width="400" height="200" responsive=true><canvas>');
          var ctx = document.getElementById("pieChart").getContext('2d');
        }
        else{
          var ctx = document.getElementById("pieChart").getContext('2d');
        }

            var myChart = new Chart(ctx, {
              type: 'pie',
              data: {
                showTooltips: true,
                labels: ["Expected(hrs)","Actual(hrs)"],
                datasets: [{
                  backgroundColor: [

                    "#2ecc71",
                    "#95a5a6"
                  ],
                  data: value
                }]
              }
            });
          }



      function pie2(value){
        var piechartContent = document.getElementById('piechartContent');
        if(piechartContent != null){
          piechartContent.innerHTML = '&nbsp;';
          $('#piechartContent').append('<canvas id="piechart" class="piechart" width="400" height="200" responsive=true><canvas>');
          var ctx = document.getElementById("piechart").getContext('2d');
        }
        else{
          var ctx = document.getElementById("piechart").getContext('2d');
        }
            var myChart = new Chart(ctx, {
              type: 'pie',
              data: {
                labels: ["Free","Engaged"],
                datasets: [{
                  backgroundColor: [

                    "#1ab394",
                    "#1c84c6"
                  ],
                  data: value
                }]
              }
            });
          }

      function pie3(value1,value2){
        var assetpiechartContent = document.getElementById('assetpiechartContent');
        if(assetpiechartContent != null){
          assetpiechartContent.innerHTML = '&nbsp;';
          $('#assetpiechartContent').append('<canvas id="assetpiechart" class="assetpiechart" width="400" height="200" responsive=true><canvas>');
          var ctx = document.getElementById("assetpiechart").getContext('2d');
        }
        else{
          var ctx = document.getElementById("assetpiechart").getContext('2d');
        }
            var myChart = new Chart(ctx, {

              type: 'pie',
              data: {
                labels: value1,
                datasets: [{
                  backgroundColor: [
                      "#2ecc71",
                      "#3498db",
                      "#95a5a6",
                      "#9b59b6",
                      "#f1c40f",
                      "#e74c3c"
                  ],
                  data: value2
                }]
              }
            });
          }

      function bar1(open,closed,inprogress,solved,total){
           $(".Chart").empty();
           var canvas = document.getElementById('Chart');
           if(myBarChart != undefined){
             myBarChart.destroy();
        }
         var data = {
            labels: ["First shift", "Second shift", "Third shift"],
            datasets: [
                {
                    label: "Open",
                    backgroundColor: "#1c84c6",
                    borderColor: "#1c84c6",
                    borderWidth: 2,
                    hoverBackgroundColor: "#1c84c6",
                    hoverBorderColor: "#1c84c6",
                    data: open,
                },
                {
                    label: "Closed",
                    backgroundColor: "#ed5565",
                    borderColor: "#ed5565",
                    borderWidth: 2,
                    hoverBackgroundColor: "#ed5565",
                    hoverBorderColor: "#ed5565",
                    data: closed,
                },
                {
                    label: "Inprogress",
                    backgroundColor: "#1ab394",
                    borderColor: "#1ab394",
                    borderWidth: 2,
                    hoverBackgroundColor: "#1ab394",
                    hoverBorderColor: "#1ab394",
                    data: inprogress,
                },
                {
                    label: "Solved",
                    backgroundColor: "#f8ac59",
                    borderColor: "#f8ac59",
                    borderWidth: 2,
                    hoverBackgroundColor: "#f8ac59",
                    hoverBorderColor: "#f8ac59",
                    data: solved,
                },
                {
                    label: "Total",
                    backgroundColor: "#003B5A",
                    borderColor: "#003B5A",
                    borderWidth: 2,
                    hoverBackgroundColor: "#003B5A",
                    hoverBorderColor: "#003B5A",
                    data: total,
                }
            ]
        };
              var option = {
                            showTooltips : true,
                            scales: {
                            yAxes:[{
                                ticks: {
                                    beginAtZero:true,
                                    min: 0,
                                   // max: 13 ,
                                    stepSize: Math.ceil($scope.max/10)

                                },
                                stacked:false,
                                gridLines: {
                                    display:true,
                                    color:"lightgrey"
                                }
                            }],
                            xAxes:[{
                                    barPercentage: 0.6,
                                    gridLines: {
                                    display:false
                                }
                            }]
                          }
                        };

                      myBarChart = Chart.Bar(canvas,{
                            data:data,
                          options:option
                        });

      }



    // Find existing Filter
    $scope.findOne = function () {
        console.log("in findone");
      $scope.filter = Filters.get({
        filterId: $stateParams.filterId
      });
        console.log("findOne..");
        console.log($scope.filter);
        var list = $scope.filter
        console.log(list);
        $scope.dashboard = list.filterlist;
        console.log($scope.dashboard);

    };



             $scope.details = function(id,data,name,type){
                 datatable_destroy();
                 console.log(data);
                 $scope.id = id;
                 var queryid = data;
                 var filter01 = $scope.query;
                 console.log("filter1 is ... ")
                 console.log(filter01);
                 $scope.filtername = name;
                 var reporttype = type;
                 console.log("reporttype is ... "+reporttype);
                 var str1 = data;

                                if(reporttype  == "Shift time reports"){
                                    //$("#graphchange").val(reporttype).find("option:selected").attr('disabled','disabled');
                                    $("#graphchange").val(reporttype);
                                    $('#graphchange').each(function(){
                                        $('option').each(function() {
                                            if(!this.selected) {
                                                $(this).attr('disabled', true);
                                            }
                                        });
                                    });

                                    $("#cbSelection").attr('checked',true);
                                    $("#cbSelection1").attr('checked',false);
                                    $("#cbSelection2").attr('checked',false);
                                    $(".utilization").prop('checked',false);
                                    $(".quality").prop('checked',false);
                                    $(".Chart").show();
                                    $(".pieChartContent").hide();
                                    $(".piechartContent").hide();
                                    $(".assetpiechartContent").hide();
                                    $(".secondtab").hide();
                                    $(".firsttab").show();
                                    $("#utilization").hide();
                                    $("#manufacturerquality").hide();
                                    $("#tickets").show();

                                }else if(reporttype  == "Employee efficiency report"){
                                    $("#graphchange").val(reporttype);
                                    $('#graphchange').each(function(){
                                        $('option').each(function() {
                                            if(!this.selected) {
                                                $(this).attr('disabled', true);
                                            }
                                        });
                                    });

                                    $(".utilization").prop('checked',false);
                                    $(".quality").prop('checked',false);
                                    $("#cbSelection").attr('checked',true);
                                    $("#cbSelection1").attr('checked',false);
                                    $("#cbSelection2").attr('checked',false);
                                    $(".Chart").hide();
                                    $(".pieChartContent").show();
                                    $(".piechartContent").hide();
                                    $(".assetpiechartContent").hide();
                                    $(".secondtab").hide();
                                    $(".thirdtab").hide();
                                    $(".firsttab").show();
                                    $("#utilization").hide();
                                    $("#manufacturerquality").hide();
                                    $("#tickets").show();

                                }else if(reporttype  == "Resource utilization"){
                                    $("#graphchange").val(reporttype);
                                    $('#graphchange').each(function(){
                                        $('option').each(function() {
                                            if(!this.selected) {
                                                $(this).attr('disabled', true);
                                            }
                                        });
                                    });

                                    $("#cbSelection1").attr('checked',true);
                                    $("#cbSelection").attr('checked',false);
                                    $("#cbSelection2").attr('checked',false);
                                    $(".tickets").prop('checked',false);
                                    $(".quality").prop('checked',false);
                                    $(".Chart").hide();
                                    $(".pieChartContent").hide();
                                    $(".piechartContent").show();
                                    $(".assetpiechartContent").hide();
                                    $(".firsttab").hide();
                                    $(".thirdtab").hide();
                                    $(".secondtab").show();
                                    $("#utilization").show();
                                    $("#manufacturerquality").hide();
                                    $("#tickets").hide();

                                }else if(reporttype == "Manufacturer quality report"){
                                    $("#graphchange").val(reporttype);
                                    $('#graphchange').each(function(){
                                        $('option').each(function() {
                                            if(!this.selected) {
                                                $(this).attr('disabled', true);
                                            }
                                        });
                                    });

                                    $("#cbSelection2").attr('checked',true);
                                    $("#cbSelection").attr('checked',false);
                                    $("#cbSelection1").attr('checked',false);
                                    $(".utilization").prop('checked',false);
                                    $(".tickets").prop('checked',false);
                                    $(".Chart").hide();
                                    $(".pieChartContent").hide();
                                    $(".piechartContent").hide();
                                    $(".assetpiechartContent").show();
                                    $(".firsttab").hide();
                                    $(".secondtab").hide();
                                    $(".thirdtab").show();
                                    $("#utilization").hide();
                                    $("#manufacturerquality").show();
                                    $("#tickets").hide();

                                }


                   for (let obj of str1) {
                       if(obj["vendor,id"] != undefined ){
                            obj["vendor.id"] = obj["vendor,id"];
                            delete obj["vendor,id"];

                        }else if(obj["escalation,level"] != undefined){
                            obj["escalation.level"] = obj["escalation,level"];
                            delete obj["escalation,level"];

                        }else if(obj["notification,time"] != undefined){
                            obj["notification.time"] = obj["notification,time"];
                            delete obj["notification,time"];

                        }else if(obj["employee,name"] != undefined){
                            obj["employee.name"] = obj["employee,name"];
                            delete obj["employee,name"];
                        }

                    }


                    console.log("str1.. is..");
                    console.log(str1);
                    $("#cbSelection").attr('checked',false);
                    $('#s02').attr('checked', false);
                    $('#s2').attr('checked', false);
                    $('#s20').attr('checked', false);
                    $('#s03').attr('checked', false);
                    $('#s3').attr('checked', false);
                    $('#s4').attr('checked', false);
                    $('#s04').attr('checked', false);
                    $('#s004').attr('checked', false);
                    $('#s5').attr('checked', false);
                    $('#s05').attr('checked', false);
                    $('#s07').attr('checked', false);
                    $('#s005').attr('checked', false);
                    $('#s0005').attr('checked', false);
                    $('#s6').attr('checked', false);
                    $('#s11').attr('checked', false);
                    $('#s12').attr('checked', false);
                    $('#s13').attr('checked', false);
                    $('#s14').attr('checked', false);
                    $('#s15').attr('checked', false);
                    $('#s16').attr('checked', false);
                    $('#s21').attr('checked', false);
                    $('#s22').attr('checked', false);
                    $('#s23').attr('checked', false);

                    $("s1").hide();
                 hide();
                    for(var x in str1){

                     console.log(Object.keys(str1[x]));
                        console.log(str1[x]);


                     if(Object.keys(str1[x]) == "status"){ //---status ---

                       // alert("in..");
                         $("s1").show();
                         $("#cbSelection").attr('checked',true);
                         console.log(str1[x]["status"][0]);
                         var drop = str1[x]["status"][0];
                         $("#select1").val(drop);
                         var txt = str1[x]["status"][1];
                         $("#see").val(txt);

                     }

                     if(Object.keys(str1[x]) == "ticketId"){ //---ticket id---

                         $(".ticketId").show();
                         $("s3").show()
                         $('#s3').attr('checked', true);
                         console.log(str1[x]["ticketId"][0]);
                         var drop = str1[x]["ticketId"][0];
                         $("#select03").val(drop);
                         var txt = str1[x]["ticketId"][1];
                         $("#see2").val(txt);

                     }
                     if(Object.keys(str1[x]) == "shift"){ // ---shift---

                         $(".shift").show();
                         $("s02").show()
                         $('#s02').attr('checked', true);
                         console.log(str1[x]["shift"][1]);
                         var drop = str1[x]["shift"][0];
                         $("#select02").val(drop);
                         var txt = str1[x]["shift"][1];
                         $("#see01").val(txt);

                     }
                    if(Object.keys(str1[x]) == "expected_hrs"){ //---expected---

                         $(".expected").show();
                         $("s03").show()
                         $('#s03').attr('checked', true);
                         console.log(str1[x]["expected"][0]);
                         var drop = str1[x]["expected"][0];
                         $("#select003").val(drop);
                         var txt = str1[x]["expected"][1];
                         $("#see02").val(txt);

                     }
                    if(Object.keys(str1[x]) == "actual_hrs"){ // ---actual---

                         $(".actual").show();
                         $("s20").show()
                         $('#s20').attr('checked', true);
                         console.log(str1[x]["actual"][0]);
                         var drop = str1[x]["actual"][0];
                         $("#select20").val(drop);
                         var txt = str1[x]["actual"][1];
                         $("#see10").val(txt);

                     }
                    if(Object.keys(str1[x]) == "name"){ // ---name---

                         $(".name").show();
                         $("s2").show()
                         $('#s2').attr('checked', true);
                         console.log(str1[x]["name"][0]);
                         var drop = str1[x]["name"][0];
                         $("#select2").val(drop);
                         var txt = str1[x]["name"][1];
                         $("#see1").val(txt);

                     }
                    if(Object.keys(str1[x]) == "complaint"){ // ---complaint---

                         $(".complaint").show();
                         $("s4").show()
                         $('#s4').attr('checked', true);
                         console.log(str1[x]["complaint"][0]);
                         var drop = str1[x]["complaint"][0];
                         //alert(drop);
                         $("#select4").val(drop);
                         var txt = str1[x]["complaint"][1];
                         $("#see3").val(txt);

                     }
                    if(Object.keys(str1[x]) == "tagid"){//---tag----

                         $(".tag").show();
                         $("s04").show()
                         $('#s04').attr('checked', true);
                         console.log(str1[x]["tagid"][0]);
                         var drop = str1[x]["tagid"][0];
                         $("#select04").val(drop);
                         var txt = str1[x]["tagid"][1];
                         $("#see03").val(txt);

                     }
                    if(Object.keys(str1[x]) == "phonenumber"){ //----phone number-----

                         $(".phoneN0").show();
                         $("s004").show()
                         $('#s004').attr('checked', true);
                         console.log(str1[x]["phonenumber"][0]);
                         var drop = str1[x]["phonenumber"][0];
                         $("#select004").val(drop);
                         var txt = str1[x]["phonenumber"][1];
                         $("#see003").val(txt);

                     }
                     if(Object.keys(str1[x]) == "employee.name"){ //----assigned to -----

                         $(".assignedto").show();
                         $("s5").show()
                         $('#s5').attr('checked', true);
                         console.log(str1[x]["employee.name"][0]);
                         var drop = str1[x]["employee.name"][0];
                         $("#select5").val(drop);
                         var txt = str1[x]["employee.name"][1];
                         $("#see4").val(txt);

                     }
                    if(Object.keys(str1[x]) == "vendor.id"){ //----vendor id -----

                         $(".vendorid").show();
                         $("s05").show()
                         $('#s05').attr('checked', true);
                         console.log(str1[x]["vendor.id"][0]);
                         var drop = str1[x]["vendor.id"][0];
                         $("#select05").val(drop);
                         var txt = str1[x]["vendor.id"][1];
                         $("#see04").val(txt);

                     }
                    if(Object.keys(str1[x]) == "escalation.level"){ //----escalation level -----

                         $(".reassign").show();
                         $("s05").show()
                         $('#s05').attr('checked', true);
                         console.log(str1[x]["escalation.level"][0]);
                         var drop = str1[x]["escalation.level"][0];
                         $("#select05").val(drop);
                         var txt = str1[x]["escalation.level"][1];
                         $("#see04").val(txt);

                     }
                    if(Object.keys(str1[x]) == "notification.time"){ //----notification  -----

                         $(".notification").show();
                         $("s005").show()
                         $('#s005').attr('checked', true);
                         console.log(str1[x]["notification.time"][0]);
                         var drop = str1[x]["notification.time"][0];
                         $("#select005").val(drop);
                         var txt = str1[x]["notification.time"][1];

                         $("#see004").val(txt);

                     }

                    if(Object.keys(str1[x]) == "userRating"){ //----rating -----

                         $(".rating").show();
                         $("s0005").show()
                         $('#s0005').attr('checked', true);
                         console.log(str1[x]["userRating"][0]);
                         var drop = str1[x]["userRating"][0];
                         $("#select0005").val(drop);
                         var txt = str1[x]["userRating"][1];
                         $("#see0004").val(txt);

                     }

                    if(Object.keys(str1[x]) == "employeeStatus"){ //----employee status -----

                         $("s01").show();
                         $("#cbSelection1").attr('checked',true);
                         console.log(str1[x]["employeeStatus"][0]);
                         var drop = str1[x]["employeeStatus"][0];
                         $("#select11").val(drop);
                         var txt = str1[x]["employeeStatus"][1];
                         $("#see11").val(txt);

                     }

                    if(Object.keys(str1[x]) == "employeeId"){ //----employee Id -----

                         $(".employeeid").show();
                         $("s12").show()
                         $('#s12').attr('checked', true);
                         console.log(str1[x]["employeeId"][0]);
                         var drop = str1[x]["employeeId"][0];
                         $("#select12").val(drop);
                         var txt = str1[x]["employeeId"][1];
                         $("#see12").val(txt);

                     }

                    if(Object.keys(str1[x]) == "employeeEmail"){ //----employee email -----

                         $(".employeeemail").show();
                         $("s13").show()
                         $('#s13').attr('checked', true);
                         console.log(str1[x]["employeeEmail"][0]);
                         var drop = str1[x]["employeeEmail"][0];
                         $("#select13").val(drop);
                         var txt = str1[x]["employeeEmail"][1];
                         $("#see13").val(txt);

                     }

                    if(Object.keys(str1[x]) == "employeeMobile"){ //----employee mobile -----

                         $(".employeemobile").show();
                         $("s14").show()
                         $('#s14').attr('checked', true);
                         console.log(str1[x]["employeeMobile"][0]);
                         var drop = str1[x]["employeeMobile"][0];
                         $("#select14").val(drop);
                         var txt = str1[x]["employeeMobile"][1];
                         $("#see14").val(txt);

                     }

                    if(Object.keys(str1[x]) == "employeeDesc"){ //----employee description -----

                         $(".employeedesc").show();
                         $("s15").show()
                         $('#s15').attr('checked', true);
                         console.log(str1[x]["employeeDesc"][0]);
                         var drop = str1[x]["employeeDesc"][0];
                         $("#select15").val(drop);
                         var txt = str1[x]["employeeDesc"][1];
                         $("#see15").val(txt);

                     }

                    if(Object.keys(str1[x]) == "manufacturer"){ //----manufacturer -----

                         $("s21").show();
                         $("#cbSelection2").attr('checked',true);
                         console.log(str1[x]["manufacturer"][0]);
                         var drop = str1[x]["manufacturer"][0];
                         $("#select21").val(drop);
                         var txt = str1[x]["manufacturer"][1];
                         $("#see21").val(txt);

                     }

                    if(Object.keys(str1[x]) == "assetType"){ //----asset type -----

                         $(".assettype").show();
                         $("s22").show()
                         $('#s22').attr('checked', true);
                         console.log(str1[x]["assetType"][0]);
                         var drop = str1[x]["assetType"][0];
                         $("#select22").val(drop);
                         var txt = str1[x]["assetType"][1];
                         $("#see22").val(txt);

                     }

                    if(Object.keys(str1[x]) == "numberOfIssues"){ //----number of issues -----

                         $(".numberissues").show();
                         $("s23").show()
                         $('#s23').attr('checked', true);
                         console.log(str1[x]["numberOfIssues"][0]);
                         var drop = str1[x]["numberOfIssues"][0];
                         $("#select23").val(drop);
                         var txt = str1[x]["numberOfIssues"][1];
                         $("#see23").val(txt);

                     }

                     if(Object.keys(str1[x]) == "date"){
                         console.log("date....")
                         console.log(Object.keys(str1[x]["date"]));
                         if(Object.keys(str1[x]["date"]) == "created_time"){ //----created -----

                         $(".created").show();
                         $("s6").show()
                         $('#s6').attr('checked', true);
                         console.log(str1[x]["date"]["created_time"][0]);
                         var drop = str1[x]["date"]["created_time"][0];
                         $("#select6").val(drop);
                         var txt = str1[x]["date"]["created_time"][1];
                         var txt1 = str1[x]["date"]["created_time"][2];

                         if(drop  == "is" || drop == ">=" || drop == "<="){
                                      $(".se1").val(txt);
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }
                                    else if(drop  == "between"){
                                      $(".se1").val(txt);
                                      $(".see1").show();
                                      $(".see1").val(txt1);
                                      $(".see01").hide();
                                    }

                                   else if(drop  == "less than days ago"|| drop == "more than days ago" || drop == "in the past"|| drop == "days ago" ){
                                      $(".see01").show();
                                      $(".see01").val(txt);
                                      $(".se1").hide();
                                      $(".see1").hide();
                                    }
                                else{
                                      $(".se1").hide();
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }




                     }
                    if(Object.keys(str1[x]["date"]) == "updated_time"){ //----updated -----

                         $(".updated").show();
                         $("s6").show()
                         $('#s6').attr('checked', true);
                         console.log(str1[x]["date"]["updated_time"][0]);
                         var drop = str1[x]["date"]["updated_time"][0];
                         $("#select6").val(drop);
                         var txt = str1[x]["date"]["updated_time"][1];
                         var txt1 = str1[x]["date"]["updated_time"][2];

                         if(drop  == "is" || drop == ">=" || drop == "<="){
                                      $(".se1").val(txt);
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }
                                    else if(drop  == "between"){
                                      $(".se1").val(txt);
                                      $(".see1").show();
                                      $(".see1").val(txt1);
                                      $(".see01").hide();
                                    }

                                   else if(drop  == "less than days ago"|| drop == "more than days ago" || drop == "in the past"|| drop == "days ago" ){
                                      $(".see01").show();
                                      $(".see01").val(txt);
                                      $(".se1").hide();
                                      $(".see1").hide();
                                    }
                                else{
                                      $(".se1").hide();
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }
                    }
                    if(Object.keys(str1[x]["date"]) == "closed_time"){ //----closed -----

                         $(".closed").show();
                         $("s8").show()
                         $('#s8').attr('checked', true);
                         console.log(str1[x]["date"]["closed_time"][0]);
                         var drop = str1[x]["date"]["closed_time"][0];
                         $("#select8").val(drop);
                         var txt = str1[x]["date"]["closed_time"][1];
                         var txt1 = str1[x]["date"]["closed_time"][2];

                          if(drop  == "is" || drop == ">=" || drop == "<="){
                                      $(".se3").val(txt);
                                      $(".see3").hide();
                                      $(".see03").hide();
                                    }
                                    else if(drop  == "between"){
                                      $(".se3").val(txt);
                                      $(".see3").show();
                                      $(".see3").val(txt1);
                                      $(".see03").hide();
                                    }

                                   else if(drop  == "less than days ago"|| drop == "more than days ago" || drop == "in the past"|| drop == "days ago" ){

                                      $(".see03").show();
                                      $(".see03").val(txt);
                                      $(".se3").hide();
                                      $(".see3").hide();
                                    }
                                else{
                                      $(".se3").hide();
                                      $(".see3").hide();
                                      $(".see03").hide();
                                    }


                     }

                    if(Object.keys(str1[x]["date"]) == "createdDate"){ //----closed -----

                         $(".createddate").show();
                         $("s16").show()
                         $('#s16').attr('checked', true);
                         console.log(str1[x]["date"]["createdDate"][0]);
                         var drop = str1[x]["date"]["createdDate"][0];
                         $("#select16").val(drop);
                         var txt = str1[x]["date"]["createdDate"][1];
                         var txt1 = str1[x]["date"]["createdDate"][2];

                          if(drop  == "is" || drop == ">=" || drop == "<="){
                                      $(".se16").val(txt);
                                      $(".see16").hide();
                                      $(".see016").hide();
                                    }
                                    else if(drop  == "between"){
                                      $(".se16").val(txt);
                                      $(".see16").show();
                                      $(".see16").val(txt1);
                                      $(".see016").hide();
                                    }

                                   else if(drop  == "less than days ago"|| drop == "more than days ago" || drop == "in the past"|| drop == "days ago" ){

                                      $(".see016").show();
                                      $(".see016").val(txt);
                                      $(".se16").hide();
                                      $(".see16").hide();
                                    }
                                else{
                                      $(".se16").hide();
                                      $(".see16").hide();
                                      $(".see016").hide();
                                    }


                     }
                    }

                 }
                 //alert("after..");
                  if(reporttype == "Resource utilization"){

                      var apply1 = str1;
                      console.log("apply is...");
                      console.log(apply);
                      var filter = new Reports({
                          apply1
                      });

        // -------------------------Redirect after save--------------
                  filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);


                  $scope.resource = response.filtered;
                  $scope.resourcevalue = response.resutil;
                  pie2($scope.resourcevalue);
                  console.log($scope.resource);
                  //$("#myBtn").hide();
                  //$(".abc").show();

                  }, function (errorResponse) {
                        console.log("error in .....")
                        $scope.error = errorResponse.data.message;
                    });

                  }
                  else if(reporttype == "Manufacturer quality report"){

                      var apply2 = str1;
                      console.log("apply is...");
                      console.log(apply);
                      var filter = new Reports({
                          apply2
                      });

        // -------------------------Redirect after save--------------
                  filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);


                  $scope.manufacturer = response.asset;
                  $scope.assetvalue1 = response.assetval.value1;
                  $scope.assetvalue2 = response.assetval.value2;
                  pie3($scope.assetvalue1,$scope.assetvalue2);
                  console.log($scope.resource);
                  //$("#myBtn").hide();
                  //$(".abc").show();
                  }, function (errorResponse) {
                        console.log("error in .....")
                        $scope.error = errorResponse.data.message;
                    });

                  }
          else{
                      var apply = str1;
                    console.log("apply is .. ")
                    console.log(apply);
                      var filter = new Reports({
                          apply
                      });
                 str1="";

    // -------------------------Redirect after save--------------
                      filter.$save(function (response) {
                          //filter.$query(function (response) {
                          console.log("client controller redirect after save")
                          //$location.path('filters/' + response._id);
                          console.log("response is.. " + response);
                          console.log(response.filter1);

                          var dashboard = Object.keys(response.filter1).length;
                          var tablearr=[];
                          console.log(response.filter1);
                          console.log(Object.keys(response.filter1).length);
                          if(dashboard > 100){
                            var datalength = 100;
                          }
                          else{
                            var datalength = dashboard;
                          }
                          for(var x=0; x<datalength ; x++){
                            tablearr.push(response.filter1[x])
                          }
                          $scope.tabledata = tablearr;
                          $scope.dashboard = response.filter1;
                          console.log(response.result);
                          var data = response.result;

                          $scope.open = data[0].open;
                          $scope.closed = data[0].closed;
                          $scope.inprogress = data[0].inprogress;
                          $scope.solved = data[0].solved;
                          $scope.total = data[0].total;

                          $scope.max = Math.max($scope.total);
                          $scope.pievalue = data[1];
                          console.log($scope.pievalue);
                          bar1($scope.open,$scope.closed,$scope.inprogress,$scope.solved,$scope.total);
                          pie1($scope.pievalue);
                          init();
                          pie();

                      }, function (errorResponse) {
                            console.log("error in .....")
                            $scope.error = errorResponse.data.message;
                        });
          }

             }



      function pie(){
        $timeout(function() {
            $("span.pie").peity("pie");
                              $(".pie-colours-1").peity("pie", {
                                  fill: function(value) {
                                      if(value > 75 ){
                                          return("#ed5565");
                                      }
                                      else if(value > 50){
                                          return("#f8ac59");
                                      }
                                      else{
                                          return("#1ab394");
                                      }

                                  }
                                });
          },900);
      }


      function hide(){

           $(".name").hide();
           $(".shift").hide();
           $(".actual").hide();
           $(".expected").hide();
           $(".ticketId").hide();
           $(".complaint").hide();
           $(".tag").hide();
           $(".phoneNo").hide();
           $(".assignedto").hide();
           $(".vendorid").hide();
           $(".escalationlevel").hide();
           $(".notification").hide();
           $(".rating").hide();
           $(".created").hide();
           $(".updated").hide();
           $(".closed").hide();
           $(".startdate").hide();
           $(".duedate").hide();
           $(".employeeid").hide();
           $(".employeeemail").hide();
           $(".employeemobile").hide();
           $(".employeedesc").hide();
           $(".createddate").hide();
           $(".manufacturer").hide();
           $(".assettype").hide();
           $(".numberissues").hide();

            $("s02").hide();
            $("s2").hide();
            $("s20").hide();
            $("s03").hide();
            $("s3").hide();
            $("s4").hide();
            $("s04").hide();
            $("s07").hide();
            $("s004").hide();
            $("s5").hide();
            $("s05").hide();
            $("s005").hide();
            $("s0005").hide();
            $("s6").hide();
            $("s7").hide();
            $("s8").hide();
            $("s9").hide();
            $("s10").hide();
            $("s12").hide();
            $("s13").hide();
            $("s14").hide();
            $("s15").hide();
            $("s16").hide();
            //$("s21").hide();
            $("s22").hide();
            $("s23").hide();
    }


      $scope.filterdata = function() {


           pie();
            //alert("hiii");
              $timeout(function() {

                    function clearAll() {
                        //location.reload();
                        $('#load').load(document.URL +  ' #load');
                    }
                  $('.select30 option:nth-child(2)').prop('disabled', 'disabled');// to disable status by default
          $('.selectedfilter option:nth-child(2)').prop('disabled', 'disabled');// to disable employee by default
          $('.selectedfilter1 option:nth-child(2)').prop('disabled', 'disabled');// to disable manufacturer by default


                  $(".pieChartContent").hide();
                  $(".piechartContent").hide();
                  $(".assetpiechartContent").hide();
                  $("#utilization").hide();
                  $("#manufacturerquality").hide();
                  $(".secondtab").hide();
                  $(".thirdtab").hide();
                  $("#cbSelection1").attr('checked',false);
                  $("#cbSelection2").attr('checked',false);
                  $(".cbSelection1").attr('checked',false);
                  Text="Shift time reports";
                        $("#graphchange").change(function () {
                            Text = $(this).find("option:selected").text().trim();
                            $(".txtdata").val(Text);
                            $(".txtdata").html(Text);
                                if(Text  == "Shift time reports"){
                                    $("#cbSelection").prop('checked',true);
                                    $("#cbSelection1").attr('checked',false);
                                    $("#cbSelection2").attr('checked',false);
                                    $(".utilization").prop('checked',false);
                                    $(".quality").prop('checked',false);
                                    $(".Chart").show();
                                    $(".pieChartContent").hide();
                                    $(".piechartContent").hide();
                                    $(".assetpiechartContent").hide();
                                    $(".secondtab").hide();
                                    $(".firsttab").show();
                                    $("#utilization").hide();
                                    $("#manufacturerquality").hide();
                                    $("#tickets").show();

                                    //$(".abc").hide();
                                    //$("#myBtn").show();
                                    $scope.filtername='';
                                    //$("#newquery1").hide();
                                }else if(Text  == "Employee efficiency report"){
                                    $("#cbSelection").prop('checked',true);
                                    $("#cbSelection1").attr('checked',false);
                                    $("#cbSelection2").attr('checked',false);
                                    $(".utilization").prop('checked',false);
                                    $(".quality").prop('checked',false);
                                    $(".Chart").hide();
                                    $(".pieChartContent").show();
                                    $(".piechartContent").hide();
                                    $(".assetpiechartContent").hide();
                                    $(".secondtab").hide();
                                    $(".thirdtab").hide();
                                    $(".firsttab").show();
                                    $("#utilization").hide();
                                    $("#manufacturerquality").hide();
                                    $("#tickets").show();

                                    //$(".abc").hide();
                                    //$("#myBtn").show();
                                    $scope.filtername='';
                                    //$("#newquery1").hide();
                                }else if(Text  == "Resource utilization"){
                                    $("#cbSelection1").prop('checked',true);
                                    $("#cbSelection").attr('checked',false);
                                    $("#cbSelection2").attr('checked',false);
                                    $(".tickets").prop('checked',false);
                                    $(".quality").prop('checked',false);
                                    $(".Chart").hide();
                                    $(".pieChartContent").hide();
                                    $(".piechartContent").show();
                                    $(".assetpiechartContent").hide();
                                    $(".firsttab").hide();
                                    $(".thirdtab").hide();
                                    $(".secondtab").show();
                                    $("#utilization").show();
                                    $("#manufacturerquality").hide();
                                    $("#tickets").hide();

                                    //$(".abc").hide();
                                    //$("#myBtn").show();
                                    $scope.filtername='';
                                    //$("#newquery1").hide();
                                }else if(Text == "Manufacturer quality report"){
                                    $("#cbSelection2").prop('checked',true);
                                    $("#cbSelection").attr('checked',false);
                                    $("#cbSelection1").attr('checked',false);
                                    $(".utilization").prop('checked',false);
                                    $(".tickets").prop('checked',false);
                                    $(".Chart").hide();
                                    $(".pieChartContent").hide();
                                    $(".piechartContent").hide();
                                    $(".assetpiechartContent").show();
                                    $(".firsttab").hide();
                                    $(".secondtab").hide();
                                    $(".thirdtab").show();
                                    $("#utilization").hide();
                                    $("#manufacturerquality").show();
                                    $("#tickets").hide();
                                    $("s21").show();
                                    //$(".abc").hide();
                                    //$("#myBtn").show();
                                    $scope.filtername = " ";
                                    //alert($scope.filtername);
                                   // $("#newquery1").hide();
                                }

                            });

                    $(document).ready(function(){
                        $(".myBtn").click(function(){
                            $("#myModal").modal();
                        });
                    });

                    var number=[""]
                       function addingnumber(){
                        var x=document.getElementById("box");
                         number.push(document.getElementById("input").value);
                        x.innerHTML=number.join('<br/>');
                       }

                       $(document).ready(function () {
                           $(".abc").hide();
                           //$(".queryname").on('click','li',function (){
                           $(".titlename").click(function() {
                             alert("li clicked..");
                             var send = $(this).html();
                               console.log(send);
                               $(".abc").show(); // will display edit and delete button
                               $(".name1").val(send);
                               $(".name2").html(send);

                                $("#newquery1").show();
                               $("#myBtn").hide();
                           });
                       });


                    $(document).ready(function(){
                        $("#edit").hide();
                        $("#newquery1").hide();
                        $(".edit").click(function(){
                            $("#save").hide();
                            $("#edit").show();
                            $("#newquery").hide();

                        });
                    });




                    $('#more').click(function () {
                        $(this).find('i').toggleClass('fa fa-caret-down').toggleClass('fa fa-caret-right');
                    });

                    $(".cbSelection").click(function(){
                        if($(this).is(":checked")){
                           // alert('true');
                            $("s1").show();
                        }else{
                            $("s1").hide();
                        }
                    });
                  $(".cbSelection1").click(function(){
                        if($(this).is(":checked")){
                           // alert('true');
                            $("s01").show();
                        }else{
                            $("s01").hide();
                        }
                    });
                  $(".cbSelection2").click(function(){
                        if($(this).is(":checked")){
                           // alert('true');
                            $("s21").show();
                        }else{
                            $("s21").hide();
                        }
                    });


                  //  <!----------------hide sub options  ---------------->


                    $(document).ready(function () {




                        $("s2").hide();
                        $("#s2").click(function(){
                            if($(this).is(":checked")){
                                $("s2").show();
                            }else{
                                $("s2").hide();
                            }
                        });

                        $("s02").hide();
                        $("#s02").click(function(){
                            if($(this).is(":checked")){
                                $("s02").show();
                            }else{
                                $("s02").hide();
                            }
                        });

                        $("s20").hide();
                        $("#s20").click(function(){
                            if($(this).is(":checked")){
                                $("s20").show();
                            }else{
                                $("s20").hide();
                            }
                        });


                        $("s03").hide();
                        $("#s03").click(function(){
                            if($(this).is(":checked")){
                                $("s03").show();
                            }else{
                                $("s03").hide();
                            }
                        });


                        $("s3").hide();
                        $("#s3").click(function(){
                            if($(this).is(":checked")){
                                $("s3").show();
                            }else{
                                $("s3").hide();
                            }
                        });


                        $("s4").hide();
                        $("#s4").click(function(){
                            if($(this).is(":checked")){
                                $("s4").show();
                            }else{
                                $("s4").hide();
                            }
                        });

                        $("s04").hide();
                        $("#s04").click(function(){
                            if($(this).is(":checked")){
                                $("s04").show();
                            }else{
                                $("s04").hide();
                            }
                        });

                        $("s004").hide();
                        $("#s004").click(function(){
                            if($(this).is(":checked")){
                                $("s004").show();
                            }else{
                                $("s004").hide();
                            }
                        });

                        $("s5").hide();
                        $("#s5").click(function(){
                            if($(this).is(":checked")){
                                $("s5").show();
                            }else{
                                $("s5").hide();
                            }
                        });

                        $("s05").hide();
                        $("#s05").click(function(){
                            if($(this).is(":checked")){
                                $("s05").show();
                            }else{
                                $("s05").hide();
                            }
                        });

                        $("s07").hide();
                        $("#s07").click(function(){
                            if($(this).is(":checked")){
                                $("s07").show();
                            }else{
                                $("s07").hide();
                            }
                        });

                        $("s005").hide();
                        $("#s005").click(function(){
                            if($(this).is(":checked")){
                                $("s005").show();
                            }else{
                                $("s005").hide();
                            }
                        });

                        $("s0005").hide();
                        $("#s0005").click(function(){
                            if($(this).is(":checked")){
                                $("s0005").show();
                            }else{
                                $("s0005").hide();
                            }
                        });

                        $("s6").hide();
                        $("#s6").click(function(){
                            if($(this).is(":checked")){
                                $("s6").show();
                            }else{
                                $("s6").hide();
                            }
                        });

                        $("s7").hide();
                        $("#s7").click(function(){
                            if($(this).is(":checked")){
                                $("s7").show();
                            }else{
                                $("s7").hide();
                            }
                        });

                        $("s8").hide();
                        $("#s8").click(function(){
                            if($(this).is(":checked")){
                                $("s8").show();
                            }else{
                                $("s8").hide();
                            }
                        });

                        $("s9").hide();
                        $("#s9").click(function(){
                            if($(this).is(":checked")){
                                $("s9").show();
                            }else{
                                $("s9").hide();
                            }
                        });

                        $("s10").hide();
                        $("#s10").click(function(){
                            if($(this).is(":checked")){
                                $("s10").show();
                            }else{
                                $("s10").hide();
                            }
                        });

                        $("s12").hide();
                        $("#s12").click(function(){
                            alert("true");
                            if($(this).is(":checked")){
                                $("s12").show();
                            }else{
                                $("s12").hide();
                            }
                        });

                        $("s13").hide();
                        $("#s13").click(function(){
                            if($(this).is(":checked")){
                                $("s13").show();
                            }else{
                                $("s13").hide();
                            }
                        });

                        $("s14").hide();
                        $("#s14").click(function(){
                            if($(this).is(":checked")){
                                $("s14").show();
                            }else{
                                $("s14").hide();
                            }
                        });

                        $("s15").hide();
                        $("#s15").click(function(){
                            if($(this).is(":checked")){
                                $("s15").show();
                            }else{
                                $("s15").hide();
                            }
                        });

                        $("s16").hide();
                        $("#s16").click(function(){
                            if($(this).is(":checked")){
                                $("s16").show();
                            }else{
                                $("s16").hide();
                            }
                        });


                        $("s21").hide();
                        $("#s21").click(function(){
                            if($(this).is(":checked")){
                                $("s21").show();
                            }else{
                                $("s21").hide();
                            }
                        });

                        $("s22").hide();
                        $("#s22").click(function(){
                            if($(this).is(":checked")){
                                $("s22").show();
                            }else{
                                $("s22").hide();
                            }
                        });

                        $("s23").hide();
                        $("#s23").click(function(){
                            if($(this).is(":checked")){
                                $("s23").show();
                            }else{
                                $("s23").hide();
                            }
                        });

                    });

                    $(function () {
                         //$("#see").hide();
                            $("#select1").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                if(selectedText  == "open"|| selectedText=="closed" || selectedText=="any"){

                                  $("#see").hide();
                                }else{
                                  $("#see").show();
                                }

                            });
                        $("#see100").hide();
                        $("#select20").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                if(selectedText  == "between"){

                                  $("#see100").show();
                                }else{
                                  $("#see100").hide();
                                }

                            });
                        $("#see230").hide();
                        $("#select23").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                if(selectedText  == "between"){

                                  $("#see230").show();
                                }else{
                                  $("#see230").hide();
                                }

                            });
                        $('#see002').hide();
                        $("#select003").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                if(selectedText  == "between"){

                                  $("#see002").show();
                                }else{
                                  $("#see002").hide();
                                }

                            });



                         $(".see1").hide();
                         $(".see01").hide();
                            $(".select1").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                if(selectedText  == "is" || selectedText == ">=" || selectedText == "<="){
                                      $(".se1").show();
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }
                                    else if(selectedText  == "between"){
                                      $(".se1").show();
                                      $(".see1").show();
                                      $(".see01").hide();
                                    }

                                   else if(selectedText  == "less than days ago"|| selectedText == "more than days ago" || selectedText == "in the past"|| selectedText == "days ago" ){

                                      $(".see01").show();
                                      $(".se1").hide();
                                      $(".see1").hide();
                                    }
                                else{
                                      $(".se1").hide();
                                      $(".see1").hide();
                                      $(".see01").hide();
                                    }
                                });

                         $(".see2").hide();
                         $(".see02").hide();
                            $(".select2").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                if(selectedText  == "is" || selectedText == ">=" || selectedText == "<="){
                                      $(".se2").show();
                                      $(".see2").hide();
                                      $(".see02").hide();
                                    }
                                    else if(selectedText  == "between"){
                                      $(".se2").show();
                                      $(".see2").show();
                                      $(".see02").hide();
                                    }

                                   else if(selectedText  == "less than days ago"|| selectedText == "more than days ago" || selectedText == "in the past"|| selectedText == "days ago" ){

                                      $(".see02").show();
                                      $(".se2").hide();
                                      $(".see2").hide();
                                    }
                                else{
                                      $(".se2").hide();
                                      $(".see2").hide();
                                      $(".see02").hide();
                                    }
                                });

                        $(".see3").hide();
                        $(".see03").hide();
                            $(".select3").change(function () {
                                var selectedText = $(this).find("option:selected").text().trim();
                                 if(selectedText  == "is" || selectedText == ">=" || selectedText == "<="){
                                      $(".se3").show();
                                      $(".see3").hide();
                                      $(".see03").hide();
                                    }
                                    else if(selectedText  == "between"){
                                      $(".se3").show();
                                      $(".see3").show();
                                      $(".see03").hide();
                                    }

                                   else if(selectedText  == "less than days ago"|| selectedText == "more than days ago" || selectedText == "in the past"|| selectedText == "days ago" ){

                                      $(".see03").show();
                                      $(".se3").hide();
                                      $(".see3").hide();
                                    }
                                else{
                                      $(".se3").hide();
                                      $(".see3").hide();
                                      $(".see03").hide();
                                    }
                                });



                        $(".see16").hide();
                        $(".see016").hide();
                            $(".select16").change(function () {
                                //alert("changed");
                                var selectedText = $(this).find("option:selected").text().trim();
                                 if(selectedText  == "is" || selectedText == ">=" || selectedText == "<="){
                                      $(".se16").show();
                                      $(".see16").hide();
                                      $(".see016").hide();
                                    }
                                    else if(selectedText  == "between"){
                                      $(".se16").show();
                                      $(".see16").show();
                                      $(".see016").hide();
                                    }

                                   else if(selectedText  == "less than days ago"|| selectedText == "more than days ago" || selectedText == "in the past"|| selectedText == "days ago" ){

                                      $(".see016").show();
                                      $(".se16").hide();
                                      $(".see16").hide();
                                    }
                                else{
                                      $(".se16").hide();
                                      $(".see16").hide();
                                      $(".see016").hide();
                                    }
                                });


                        });

                    $(function () {

                        hide();


                        var selectedText=[]

                    var checkedtext=[]

                            $(".select30").change(function () {

                                 selectedText = $(this).find("option:selected").attr('disabled','disabled').text().trim();
                        if(selectedText  == "name"){
                            $(".name").show();
                            $('#s2').val(this.checked);
                            $('#s2').prop('checked',true);
                            $("s2").show();
                        }
                        else if(selectedText  == "ticketId"){
                            $(".ticketId").show();
                            $('#s3').val(this.checked);
                            $('#s3').prop('checked',true);
                            $("s3").show();


                        }
                         else if(selectedText  == "tickets in shift"){
                            $(".shift").show();
                            $('#s02').val(this.checked);
                            $('#s02').prop('checked',true);
                            $("s02").show();
                        }
                        else if(selectedText  == "actual time"){
                            $(".actual").show();
                            $('#s20').val(this.checked);
                            $('#s20').prop('checked',true);
                            $("s20").show();
                        }
                        else if(selectedText  == "expected time"){
                            $(".expected").show();
                            $('#s03').val(this.checked);
                            $('#s03').prop('checked',true);
                            $("s03").show();

                        }
                        else if(selectedText  == "complaint"){
                            $(".complaint").show();
                            $('#s4').val(this.checked);
                            $('#s4').prop('checked',true);
                            $("s4").show();
                            checkedtext="complaint"

                        }
                       else if(selectedText  == "tag"){
                            $(".tag").show();
                            $('#s04').val(this.checked);
                            $('#s04').prop('checked',true);
                            $("s04").show();
                            checkedtext="tag"


                        }else if(selectedText  == "phone number"){
                            $(".phoneNo").show();
                            $('#s004').val(this.checked);
                            $('#s004').prop('checked',true);
                            $("s004").show();
                            checkedtext="phone number"


                        }else if(selectedText  == "assigned to"){
                            $(".assignedto").show();
                            $('#s5').val(this.checked);
                            $('#s5').prop('checked',true);
                            $("s5").show();
                            checkedtext="assignedto"

                        }else if(selectedText  == "vendor id"){
                            $(".vendorid").show();
                            $('#s05').val(this.checked);
                            $('#s05').prop('checked',true);
                            $("s05").show();
                            checkedtext="vendor id"

                        }else if(selectedText  == "escalation level"){
                            $(".escalationlevel").show();
                            $('#s07').val(this.checked);
                            $('#s07').prop('checked',true);
                            $("s07").show();
                            checkedtext="escalation level"

                        }else if(selectedText  == "notification"){
                            $(".notification").show();
                            $('#s005').val(this.checked);
                            $('#s005').prop('checked',true);
                            $("s005").show();
                            checkedtext="notification"

                        }else if(selectedText  == "rating"){
                            $(".rating").show();
                            $('#s0005').val(this.checked);
                            $('#s0005').prop('checked',true);
                            $("s0005").show();
                            checkedtext="rating"

                        } else if(selectedText  == "created date"){
                            $(".created").show();
                            $('#s6').val(this.checked);
                            $('#s6').prop('checked',true);
                            $("s6").show();

                        }
                        else if(selectedText  == "updated date"){
                            $(".updated").show();
                            $('#s7').val(this.checked);
                            $('#s7').prop('checked',true);
                            $("s7").show();

                        }
                          else if(selectedText  == "closed date"){
                          $(".closed").show();
                             $('#s8').val(this.checked);
                            $('#s8').prop('checked',true);
                              $("s8").show();

                        }
                          else if(selectedText  == "start date"){
                          $(".startdate").show();
                                     $('#s9').val(this.checked);
                            $('#s9').prop('checked',true);
                              $("s9").show();

                        }
                          else if(selectedText  == "due date"){
                          $(".duedate").show();
                                     $('#s10').val(this.checked);
                            $('#s10').prop('checked',true);
                              $("s10").show();

                        }



                            });

                        $(".selectedfilter").change(function () {

                            selectedText = $(this).find("option:selected").attr('disabled','disabled').text().trim();
                            if(selectedText  == "employee id"){
                                $(".employeeid").show();
                                $('#s12').val(this.checked);
                                $('#s12').prop('checked',true);
                                $("s12").show();
                            }

                            else if(selectedText  == "employee email"){
                                $(".employeeemail").show();
                                $('#s13').val(this.checked);
                                $('#s13').prop('checked',true);
                                $("s13").show();


                            }
                            else if(selectedText  == "employee mobile"){
                                $(".employeemobile").show();
                                $('#s15').val(this.checked);
                                $('#s15').prop('checked',true);
                                $("s15").show();
                            }
                            else if(selectedText  == "employee description"){
                                $(".employeedesc").show();
                                $('#s14').val(this.checked);
                                $('#s14').prop('checked',true);
                                $("s14").show();
                            }
                            else if(selectedText  == "created date"){
                                $(".createddate").show();
                                $('#s16').val(this.checked);
                                $('#s16').prop('checked',true);
                                $("s16").show();
                            }
                        });

                        $(".selectedfilter1").change(function () {

                            selectedText = $(this).find("option:selected").attr('disabled','disabled').text().trim();
                            if(selectedText  == "asset type"){
                                $(".assettype").show();
                                $('#s22').val(this.checked);
                                $('#s22').prop('checked',true);
                                $("s22").show();
                            }
                            else if(selectedText  == "number of issues"){
                                $(".numberissues").show();
                                $('#s23').val(this.checked);
                                $('#s23').prop('checked',true);
                                $("s23").show();
                            }
                        });


                        });

                    $( function (){
                        $("#clear").click(function(){
                            $(".name").hide();
                            $(".ticketId").hide();
                            $(".shift").hide();
                            $(".actual").hide();
                            $(".expected").hide();
                            $(".complaint").hide();
                            $(".assignedto").hide();
                            $(".tag").hide();
                            $(".phoneNo").hide();
                            $(".assignedto").hide();
                            $(".vendorid").hide();
                            $(".escalationlevel").hide();
                            $(".notification").hide();
                            $(".rating").hide();
                            $(".created").hide();
                            $(".updated").hide();
                            $(".closed").hide();
                            $(".startdate").hide();
                            $(".duedate").hide();
                            $(".employeeid").hide();
                            $(".employeeemail").hide();
                            $(".employeedesc").hide();
                            $(".createddate").hide();
                            $(".manufacturer").hide();
                            $(".assettype").hide();
                            $(".numberissues").hide();

                        });
                    });


                    $(document).ready(function()
                    {
                     $("#saveoption").click(function(){
                      showpopup();
                     });
                     $("#close_login").click(function(){
                      hidepopup();
                     });
                    });

                    function showpopup()
                    {
                     $("#loginform").fadeIn();
                     $("#loginform").css({"visibility":"visible","display":"block"});
                    }

                    function hidepopup()
                    {
                     $("#loginform").fadeOut();
                     $("s1");
                     $("#loginform").css({"visibility":"hidden","display":"none"});
                    }

                     $("#myBtn").click(function(){
                            $("#myModal").modal();
                        });




               }, 200)
        }

  }
]);

'use strict';

//reports service used for communicating with the reports REST endpoints
angular.module('reports').factory('Reports', ['$resource',
  function ($resource) {
    return $resource('api/reports/:reportId', {
      reportId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the resources module
angular.module('resources').run(['Menus',
  function (Menus) {
   /*// Add the resources dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Resources',
      state: 'resources',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'resources', {
      title: 'List Resources',
      state: 'resources.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'resources', {
      title: 'Create Resources',
      state: 'resources.create',
      roles: ['user']
    });
      */
     
  }
]);

'use strict';

// Setting up route
angular.module('resources').config(['$stateProvider',
  function ($stateProvider) {
    // resources state routing
    $stateProvider
      .state('resources', {
        abstract: true,
        url: '/resources',
        template: '<ui-view/>'
      })
      .state('resources.list', {
        url: '',
        templateUrl: 'modules/resources/client/views/list-resources.client.view.html'
      })
      .state('resources.create', {
        url: '/create',
        templateUrl: 'modules/resources/client/views/create-resource.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('resources.view', {
        url: '/:resourceId',
        templateUrl: 'modules/resources/client/views/view-resource.client.view.html'
      })
      .state('resources.edit', {
        url: '/:resourceId/edit',
        templateUrl: 'modules/resources/client/views/edit-resource.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// resources controller
angular.module('resources').controller('ResourcesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Resources',
  function ($scope, $stateParams, $location, Authentication, Resources) {
    $scope.authentication = Authentication;

    // Create new resource
    $scope.create = function (isValid) {
        
        console.log("client resource create controller")
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resourceForm');
        console.log("true...")
        return false;
      }

      // Create new resource object
          console.log("client controller create new resource object")
      var resource = new Resources({
         
        title: this.title,
        content: this.content
      });
        console.log("value is "+resource);
        for(var x in resource){
            console.log(x[0]);
        }
      // Redirect after save
      resource.$save(function (response) {
          console.log("client controller redirect after save")
        $location.path('resources/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing resource
    $scope.remove = function (resource) {      
        console.log("client controller remove existing resource")    
      if (resource) {
        resource.$remove();

        for (var i in $scope.resources) {
          if ($scope.resources[i] === resource) {
            $scope.resources.splice(i, 1);
          }
        }
      } else {
        $scope.resource.$remove(function () {
          $location.path('resources');
        });
      }
    };

    // Update existing resource
    $scope.update = function (isValid) {
     console.log("client controller update existing resource")

      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resourceForm');

        return false;
      }

      var resource = $scope.resource;

      resource.$update(function () {
        $location.path('resources/' + resource._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of resources
    $scope.find = function () {
      $scope.resources = Resources.query();
    };

    // Find existing resource
    $scope.findOne = function () {
      $scope.resource = Resources.get({
        resourceId: $stateParams.resourceId
      });
    };
  }
]);

'use strict';

//resources service used for communicating with the resources REST endpoints
angular.module('resources').factory('Resources', ['$resource',
  function ($resource) {
    return $resource('api/resources/:resourceId', {
      resourceId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the serverchecks module
angular.module('serverchecks').run(['Menus',
  function (Menus) {
 /*   // Add the serverchecks dropdown item
    Menus.addMenuItem('topbar', {
      title: 'serverchecks',
      state: 'serverchecks',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'serverchecks', {
      title: 'List serverchecks',
      state: 'serverchecks.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'serverchecks', {
      title: 'Create serverchecks',
      state: 'serverchecks.create',
      roles: ['user']
    });*/
      
     
  }
]);

'use strict';

// Setting up route
angular.module('serverchecks').config(['$stateProvider',
  function ($stateProvider) {
    // serverchecks state routing
    $stateProvider
      .state('serverchecks', {
        abstract: true,
        url: '/serverchecks',
        template: '<ui-view/>'
      })
      .state('serverchecks.list', {
        url: '',
        templateUrl: 'modules/serverchecks/client/views/list-serverchecks.client.view.html'
      })
      .state('serverchecks.create', {
        url: '/create',
        templateUrl: 'modules/serverchecks/client/views/create-servercheck.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('serverchecks.view', {
        url: '/:servercheckId',
        templateUrl: 'modules/serverchecks/client/views/view-servercheck.client.view.html'
      })
      .state('serverchecks.edit', {
        url: '/:servercheckId/edit',
        templateUrl: 'modules/serverchecks/client/views/edit-servercheck.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// serverchecks controller
angular.module('serverchecks').controller('ServerchecksController', ['$scope', '$stateParams', '$location', 'Authentication', 'Serverchecks',
  function ($scope, $stateParams, $location, Authentication, Serverchecks) {
    $scope.authentication = Authentication;

    // Create new servercheck
    $scope.create = function (isValid) {
        
        console.log("client servercheck create controller")
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'servercheckForm');
        console.log("true...")
        return false;
      }

      // Create new servercheck object
          console.log("client controller create new servercheck object")
      var servercheck = new Serverchecks({
         
        title: this.title,
        content: this.content
      });
        console.log("value is "+servercheck);
        for(var x in servercheck){
            console.log(x[0]);
        }
      // Redirect after save
      servercheck.$save(function (response) {
          console.log("client controller redirect after save")
        $location.path('serverchecks/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing servercheck
    $scope.remove = function (servercheck) {      
        console.log("client controller remove existing servercheck")    
      if (servercheck) {
        servercheck.$remove();

        for (var i in $scope.serverchecks) {
          if ($scope.serverchecks[i] === servercheck) {
            $scope.serverchecks.splice(i, 1);
          }
        }
      } else {
        $scope.servercheck.$remove(function () {
          $location.path('serverchecks');
        });
      }
    };

    // Update existing servercheck
    $scope.update = function (isValid) {
     console.log("client controller update existing servercheck")

      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'servercheckForm');

        return false;
      }

      var servercheck = $scope.servercheck;

      servercheck.$update(function () {
        $location.path('serverchecks/' + servercheck._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of serverchecks
    $scope.find = function () {
      $scope.serverchecks = Serverchecks.query();
    };

    // Find existing servercheck
    $scope.findOne = function () {
      $scope.servercheck = Serverchecks.get({
        servercheckId: $stateParams.servercheckId
      });
    };
  }
]);

'use strict';

//serverchecks service used for communicating with the serverchecks REST endpoints
angular.module('serverchecks').factory('serverchecks', ['$resource',
  function ($resource) {
    return $resource('api/serverchecks/:servercheckId', {
      servercheckId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the shedulers module
angular.module('shedulers').run(['Menus',
  function (Menus) {
 /*   // Add the shedulers dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Shedulers',
      state: 'shedulers',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'shedulers', {
      title: 'List Shedulers',
      state: 'shedulers.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'shedulers', {
      title: 'Create Shedulers',
      state: 'shedulers.create',
      roles: ['user']
    });*/
      
     
  }
]);

'use strict';

// Setting up route
angular.module('shedulers').config(['$stateProvider',
  function ($stateProvider) {
    // shedulers state routing
    $stateProvider
      .state('shedulers', {
        abstract: true,
        url: '/shedulers',
        template: '<ui-view/>'
      })
      .state('shedulers.list', {
        url: '',
        templateUrl: 'modules/shedulers/client/views/list-shedulers.client.view.html'
      })
      .state('shedulers.create', {
        url: '/create',
        templateUrl: 'modules/shedulers/client/views/create-sheduler.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('shedulers.view', {
        url: '/:shedulerId',
        templateUrl: 'modules/shedulers/client/views/view-sheduler.client.view.html'
      })
      .state('shedulers.edit', {
        url: '/:shedulerId/edit',
        templateUrl: 'modules/shedulers/client/views/edit-sheduler.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// shedulers controller
angular.module('shedulers').controller('ShedulersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Shedulers',
  function ($scope, $stateParams, $location, Authentication, Shedulers) {
    $scope.authentication = Authentication;

    // Create new sheduler
    $scope.create = function (isValid) {
        
        console.log("client sheduler create controller")
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'shedulerForm');
        console.log("true...")
        return false;
      }

      // Create new sheduler object
          console.log("client controller create new sheduler object")
      var sheduler = new Shedulers({
         
        title: this.title,
        content: this.content
      });
        console.log("value is "+sheduler);
        for(var x in sheduler){
            console.log(x[0]);
        }
      // Redirect after save
      sheduler.$save(function (response) {
          console.log("client controller redirect after save")
        $location.path('shedulers/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing sheduler
    $scope.remove = function (sheduler) {      
        console.log("client controller remove existing sheduler")    
      if (sheduler) {
        sheduler.$remove();

        for (var i in $scope.shedulers) {
          if ($scope.shedulers[i] === sheduler) {
            $scope.shedulers.splice(i, 1);
          }
        }
      } else {
        $scope.sheduler.$remove(function () {
          $location.path('shedulers');
        });
      }
    };

    // Update existing sheduler
    $scope.update = function (isValid) {
     console.log("client controller update existing sheduler")

      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'shedulerForm');

        return false;
      }

      var sheduler = $scope.sheduler;

      sheduler.$update(function () {
        $location.path('shedulers/' + sheduler._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of shedulers
    $scope.find = function () {
      $scope.shedulers = Shedulers.query();
    };

    // Find existing sheduler
    $scope.findOne = function () {
      $scope.sheduler = Shedulers.get({
        shedulerId: $stateParams.shedulerId
      });
    };
  }
]);

'use strict';

//shedulers service used for communicating with the shedulers REST endpoints
angular.module('shedulers').factory('Shedulers', ['$resource',
  function ($resource) {
    return $resource('api/shedulers/:shedulerId', {
      shedulerId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the Articles module
angular.module('sources', ['ng-sweet-alert', 'datatables']).run(['Menus',
  function (Menus) {
    // Add the articles dropdown item
    // Menus.addMenuItem('topbar', {
    //   title: 'Asset Configuration',
    //   state: 'sources',
    //   type: 'dropdown',
    //   roles: ['*']
    // });

    // // Add the dropdown list item
    // Menus.addSubMenuItem('topbar', 'sources', {
    //   title: 'Source addition',
    //   state: 'sources.addition'
    // });

    // // Add the dropdown create item
    // Menus.addSubMenuItem('topbar', 'sources', {
    //   title: 'Source Configuration',
    //   state: 'sources.create',
    //   roles: ['user']
    // });


  }
]);

'use strict';

// Setting up route
angular.module('sources', ['ng-sweet-alert','ngMap']).config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('sources', {
        abstract: true,
        url: '/sources',
        template: '<ui-view/>'
      })
      .state('sources.addition', {
        url: '/source_addition',
        templateUrl: 'modules/sources/client/views/addition-sources.client.view.html',
        data: {
          roles: ['user', 'admin', 'technician']
        }
      })
      .state('sources.create', {
        url: '/source_configration',
        templateUrl: 'modules/sources/client/views/create-source.client.view.html',
        data: {
          roles: ['user', 'admin', 'technician']
        }
      })
      .state('sources.email', {
        url: '/email_Configuration',
        templateUrl: 'modules/sources/client/views/emailConfiguration.html',
        data: {
          roles: ['user', 'admin', 'technician']
        }
      })
      .state('sources.sms', {
        url: '/sms_Configuration',
        templateUrl: 'modules/sources/client/views/smsConfiguration.html',
        data: {
          roles: ['user', 'admin', 'technician']
        }
      })
      // .state('sources.exmpl', {
      //   url: '/exmpl',
      //   templateUrl: 'modules/sources/client/views/examples/examples.html',
      //   data: {
      //     roles: ['user', 'admin','technician']
      //   }
      // })
      .state('sources.view', {
        url: '/:sourceId',
        templateUrl: 'modules/sources/client/views/view-source.client.view.html'
      })
      .state('sources.edit', {
        url: '/:sourceId/edit',
        templateUrl: 'modules/sources/client/views/edit-source.client.view.html',
        data: {
          roles: ['user', 'admin', 'technician']
        }
      });
  }
]);

'use strict';
var mainObject = {};
var app = angular.module('sources' /* , ['oitozero.ngSweetAlert'] */ );
app.filter('kDateAddFromDateISO8601', [function () {
  return function (isoDateString, days) {
    var parts;
    var isoTime;
    var date;
    isoDateString = isoDateString || "";
    days = days || 0;
    parts = isoDateString.match(/\d+/g);
    isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
    date = new Date(isoTime);
    if (days) {
      date.setDate(date.getDate() + days);
    }
    return date;
  };
}]);

app.directive('repeatDone', function () {
  return function (scope, element, attrs) {
    if (scope.$last) { // all are rendered
      scope.$eval(attrs.repeatDone);
    }
  }
})
/**
 * 
 * Directive For make DD/MM/YYYY formate Date in the input Edit field
 * 
 */
app.directive('jqdatepicker', ["$filter", function ($filter) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ngModelCtrl) {
      element.datepicker({
        dateFormat: 'dd/mm/yy',
        onSelect: function (date) {
          var ar = date.split("/");
          date = new Date(ar[2] + "-" + ar[1] + "-" + ar[0]);
          ngModelCtrl.$setViewValue(date.getTime());
          scope.$apply();
        }
      });
      ngModelCtrl.$formatters.unshift(function (v) {
        return $filter('date')(v, 'dd/MM/yyyy');
      });
    }
  };
}]);


/**
 * 
 * Directive which will not allow sapce in the input place
 * 
 */
app.directive('noSpaces', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      attrs.ngTrim = 'false';

      element.bind('keydown', function (e) {
        if (e.which === 32) {
          e.preventDefault();
          return false;
        }
      });

      ngModel.$parsers.unshift(function (value) {
        var spacelessValue = value.replace(/ /g, '');

        if (spacelessValue !== value) {
          ngModel.$setViewValue(spacelessValue);
          ngModel.$render();
        }
        return spacelessValue;
      });
    }
  };
});

// app.controller('testCtrl', ['$scope', function testCtrl($scope) {
//   $scope.latlng = [-25.363882,131.044922];
//   $scope.getpos = function(event){
//      $scope.latlng = [event.latLng.lat(), event.latLng.lng()];
//   };
// }]);



/**
 * 
 * Angular Controller Start
 * 
 */
app.controller('SourcesController', ['$scope', '$interval', '$timeout', '$filter', '$http', '$stateParams', '$compile', '$location', 'Authentication', 'Sources'/* ,'DialogService' */ /* ,'SweetAlert' */ ,
  function ($scope, $interval, $timeout, $filter, $http, $stateParams, $compile, $location, Authentication, Sources/* DialogService *//* ,SweetAlert */ ) {
    $scope.authentication = Authentication;
    var object = new Object() ;
    var object2 = new Object();
    var object3 = new Object();
    var object4 = new Object();
    var ticketObject = new Object();
    var sourceAdditionUpdate_Id, AssetData;
    var dt;
    var flag = 0,
      PDFflag = 0,
      checkUser, addDataFromFileFlag = 0;
    var my_val, emailobject, emailCheckedData = {};
    var mfgId, assetTID, mdlID, empID, subDeptId, deptID, locTID, locID, emprpt, loctype, undrloc, prioritytype, ntfcode, esclcode, rollid, userReprt, prblmAstID, astMpngPrblmId, findUser, smsCheckedData, asset_type, notifyto, userid, vendorCompanyId, prblmstatus;
    var Assetdata, mfgData, modelData, employeeData, departmentData, subDepartmentData, priorityData, rollData, locationTypeData, locData, problemData, userData, notificationData, escalationData, assetMappingData, shiftData, vendorData;
    var assetIndex, manufactureIndex, modelIndex, employeeIndex, deptIndex, sDeptIndex, vendorIndex, priorityIndex, rollIndex, locTyIndex, locIndex, problemIndex, userIndex, notificationIndex, escalationIndex, assetMappingIndex, shiftIndex;
    var user = Authentication.user._id;
    var UclientId = Authentication.user.lastName;
    var users = new Object();
    var userScope = Authentication.user.roles;
    $scope.makeSubmitbuttonTrue=true;
    
    var userscope;
    // $scope.adminUser=userscope;
    var long;
    var lati;
    var userStatus = Authentication.user.status;
    $scope.user_last_name = Authentication.user.lastName;
    $scope.authentication = Authentication;
    $scope.edit = true;
    // alert($scope.adminUser);
    $scope.changemap = true;
    $scope.required = true;
    $("#addTemplate").hide();

    

    var marker1 = {lat: 37.769, lng: -122.44};

    var markersDisplayed = 0;
    var markersAdded = 0;
    var maxMarkersToDisplay = 3;
    var increment = 0.02;
    var startingLongitude = -122.44;
    var startingLatitude = 37.769;





    
    $scope.toggleAddAndRemoveMarkers = function () {

        //if 3 displayed already, pop first one off of the array
        if(markersDisplayed >= 3) {
            markersDisplayed--;
            $scope.positions.shift();
        }
        //addd a new position
        markersDisplayed++;
        $scope.positions.push(
            { 
                lat: 12.925283925247093, 
                lng: 77.58794000629382
            });
        markersAdded++;
        };
    $scope.positions = [];

    // $scope.image=Authentication.user.profileImageURL;
// alert($scope.image);
    $scope.address = "SF, CA";
        $scope.onDragEnd = function (marker, $event) {
            var lat = marker.latLng.lat();
            var lng = marker.latLng.lng();
            $scope.Longitude=lat;
            $scope.Latitude=lng;

			/* GeoCoder: To convert LntLng to Formatted address with Mustaches :D */
            alert("inside on draged");
            // alert(lat);
            // alert(lng);
            
        };
    var vm = this;
    vm.toggleBounce = function() {
      if (this.getAnimation() != null) {
        this.setAnimation(null);
      } else {
        this.setAnimation(google.maps.Animation.BOUNCE);
      }
    }

    $scope.showMapfun=function(){
    $scope.showMap=true;
      
    }
    // console.log(chalk.red("please Dont use Console"));

    // DialogService.setDefaultTemplate("<div><div class=\"dc-modal-body\">This is set from " +
    // "the controller - {{message}}</div></div>");
    // .withOption('searching', false)
    // .withOption('info', false);

    // $scope.dtOptions[0].visible = false;
    // $scope.dtOptions[3].visible = true;

    $scope.optional=function(){
      // alert('inside option');
      // alert($scope.comment);
      var check=$scope.comment;
      if($scope.comment=='true'){
        // alert('inside if');
        $scope.requireOptional=true;
        $scope.touch=true;
      // alert($scope.touch);
        
      }
      else {
        $scope.requireOptional=false;
        $scope.touch=false;
      }
      
    }

    $scope.status = {
      "Status": ["open", "inprogress", "solved", "closed"]
    };
    if (userStatus == 'Enable') {
      $scope.userEnable = true;
    } else {
      $scope.userEnable = false;
    }


    $scope.fireEvent = function () {
      // This will only run after the ng-repeat has rendered its things to the DOM
      $timeout(function () {
        $scope.$broadcast('thingsRendered');
      }, 0);
    };


    $scope.sourceAddition = function () {
      $scope.showNew = true;
      $scope.required = false;
      $scope.newID = 'Please Enter new Asset Type ID';
      $scope.newTagID = 'Please Enter new Tag ID';
      $scope.tag_id = '';
      // $('#source_asset_type_id_no').attr('placeholder', 'Please Enter New Asset type ID');
      // $('#tag_id').attr('placeholder', 'Please Enter New Tag ID');
      $scope.changeAST = function () {
        $scope.newID = '';
        // $scope.newTagID = '';
      }
      $scope.changeTag = function () {
        $scope.newTagID = '';
        // $scope.newTagID = '';
      }

      $scope.touched = true;
      console.log("inside FIndTwo Function");
      var data2 = new Sources();
      $scope.selectedAsset = object3.source_asset_type_id_no;
      // alert(table);
      data2.messageType = "SourceAdditionUpdate";
      data2.source_Additions_Update
      data2.tableId = sourceAdditionUpdate_Id;
      // console.log(table);
      data2.$save(function (response) {
        $scope.object = response;
        console.log("inside UpdateSA");
        console.log(response);
        mfgId = response.source_mfg_id_no;
        assetTID = response.source_asset_type_id_no;
        // alert(response.source_model_id_no);
        mdlID = response.source_model_id_no;
        empID = response.source_user_id_no;
        subDeptId = response.source_sub_department_id_no;
        deptID = response.source_department_id_no;
        locID = response.source_location_id;
        locTID = response.source_location_type_id;
        $(".ATID").val(response.source_asset_type_id_no).trigger("chosen:updated");
        $(".MFID").val(response.source_mfg_id_no).trigger("chosen:updated");
        // alert(response.source_model_id_no);
        userid = response.source_user_id_no;
        $(".MDID2").val(response.source_model_id_no).trigger("chosen:updated");
        $(".EMPID").val(response.source_user_id_no).trigger("chosen:updated");
        $(".SDID").val(response.source_sub_department_id_no).trigger("chosen:updated");
        $(".DPID").val(response.source_department_id_no).trigger("chosen:updated");
        $(".LTID").val(response.source_location_type_id).trigger("chosen:updated");
        $(".LCID").val(response.source_location_id).trigger("chosen:updated");
        $(".ASAST").val(response.source_asset_type).trigger("chosen:updated");
        notifyto = response.user_notify_to;
        asset_type = response.source_asset_type;
        vendorCompanyId = response.vendor_Company_id;
        $(".ntf").val(response.user_notify_to).trigger("chosen:updated");
        $(".chzn-selectvendor").val(response.vendor_Company_id).trigger("chosen:updated");
        $scope.source_installation_date = response.source_installation_date;
        $scope.source_next_service = response.source_next_service;
        $scope.source_amc_expr = response.source_amc_expr;
        $scope.source_last_service = response.source_last_service;




        // $(".ATID").val(assetTID).trigger("chosen:updated");
        // $(".MFID").val(mfgId).trigger("chosen:updated");
        // // alert(response.source_model_id_no);
        // // userid = response.source_user_id_no;
        // $(".MDID2").val(mdlID).trigger("chosen:updated");
        // $(".EMPID").val(empID).trigger("chosen:updated");
        // $(".SDID").val(subDeptId).trigger("chosen:updated");
        // $(".DPID").val(deptID).trigger("chosen:updated");
        // $(".LTID").val(locTID).trigger("chosen:updated");
        // $(".LCID").val(locID).trigger("chosen:updated");
        // $(".ASAST").val(asset_type).trigger("chosen:updated");
        // // notifyto = response.user_notify_to;
        // // asset_type = response.source_asset_type;
        // // vendorCompanyId = response.vendor_Company_id;
        // $(".ntf").val(notifyto).trigger("chosen:updated");
        // $(".chzn-selectvendor").val(vendorCompanyId).trigger("chosen:updated");



        // alert("inside update SA");
        // alert();
        // console.log(response);
        $scope.object3 = response;
        my_val = response.source_mfg_id_no;
        // $(".chzn-select3").val(my_val).trigger("chosen:updated");

        // alert(my_val);
        console.log(object3.source_mfg_id_no);
        console.log(object3);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      })


    }


    $scope.locationCopy = function () {
      $scope.location_id = '';
      $scope.required = false;
      // $("#").attr("required", false);
      document.getElementById("inputid2").removeAttribute("required");
      // $("#inputid").prop('required', false);
      // $("#inputid2").prop('required', false);

    }
    /**
     * 
     * 
     * For Add data From Excel File
     * 
     * 
     */

    var checkDuplicate_function = function (arr) {
      // alert("check match");
      for (var i = 0; i <= arr.length; i++) {
        for (var j = i; j <= arr.length; j++) {
          if (i != j && arr[i] == arr[j]) {
            // alert(arr[i]);
            // alert(arr[j]);
            // alert(i);
            // alert(j);
            alert('matched');
            return true;
          }
        }
      }
      return false;
    }
    var checkDuplicate_functionsInTwoArray = function (arr1, arr2) {
      for (var i = 0; i < arr1.length; i++) {
        for (var j = 0; j < arr2.length; j++) {
          if (arr2[j] === arr1[i]) {
            return true;
          }
        }
      }
    }



    function arrayContainsArray_function_function(superset, subset) {
      alert(superset);
      alert(subset)
      alert("vanilla");
      if (0 === subset.length) {
        return false;
      }
      return subset.every(function (value) {
        return (superset.indexOf(value) >= 0);
      });
    }

    function sourceAddtion(e) {

      alert("file");
      var assetID = [],
        tagId = [],
        assetTypeID = [],
        manufactureId = [],
        modelId = [],
        userId = [],
        vendorCompanyId = [],
        subDepartmentId = [],
        departmentId = [],
        locationTypeId = [],
        locationId = [],
        notifyTo = [],
        assetType = [],
        installationDate = [],
        lastService = [],
        nextService = [],
        amcExpiry = [];

      //Get the files from Upload control
      var files = e.target.files;
      var i, f;
      //Loop through files
      for (i = 0, f = files[i]; i != files.length; ++i) {
        var reader = new FileReader();
        var name = f.name;
        reader.onload = function (e) {
          var data = e.target.result;
          var result;
          var workbook = XLSX.read(data, {
            type: 'binary'
          });
          var sheet_name_list = workbook.SheetNames;
          sheet_name_list.forEach(function (y) { /* iterate through sheets */
            //Convert the cell value to Json
            var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
            if (roa.length > 0) {
              result = roa;
            }
          });
          console.log(result);
          var assetFlagFileSave = 0;
          // for (var i = 0; i < result.length; i++) {
          //   if (/\s/.test(result[i].AssetID)) {
          //     alert("please remove the space for asset id in line number " + (i + 2));
          //     assetFlagFileSave = 1;
          //   } else {
          //     if (result[i].AssetID === "" || result[i].AssetID === null /* ||result[i].AssetID!="" */ || result[i].Description === undefined) {
          //       alert("plpease fill proper data");
          //       assetFlagFileSave = 1;
          //     } else {
          //       assetId[i] = result[i].AssetID;
          //       description[i] = result[i].Description;
          //       assetFlagFileSave = 0;
          //     }
          //   }
          //   if (object[0].asset_type_id_no.length !== 0) {
          //     if (checkDuplicate_functionsInTwoArray(object[0].asset_type_id_no, assetId)) {
          //       alert("Duplcate Data  ");
          //       assetFlagFileSave = 1;
          //     } else {
          //       alert("changed flag")
          //       assetFlagFileSave = 0
          //     }
          //   }

          // }
          for (var i = 0; i < result.length; i++) {
            if (/\s/.test(result[i].Asset_Id) || /\s/.test(result[i].Tag_Id)) {
              alert("please remove the space in line number " + (i + 1));
              assetFlagFileSave = 1;
            }
            // if (moment(result[i].Installation_Date, "DD/MM/YYYY", true).isValid() || moment(result[i].Last_Service, "DD/MM/YYYY", true).isValid() || moment(result[i].Next_Service, "DD/MM/YYYY", true).isValid() || moment(result[i].AMC_Expiry, "DD/MM/YYYY", true).isValid()) {
            //   alert("please Enter a date in to the 'DD/MM/YYYY' formate ");
            //   assetFlagFileSave = 1;
            // }
            /*  if(!arrayContainsArray_function(object[0].asset_type_id_no, )){
               alert("plase add data first in configuration page");
               assetFlagFileSave = 1;
             }
             else */
            if (assetFlagFileSave == 0) {
              // alert(result[i].Installation_Date);
              // if (!moment(result[i].Installation_Date, "DD/MM/YYYY", true).isValid()) {
              //   alert("please Enter a date in to the 'DD/MM/YYYY' formate in installation Date");
              //   // assetFlagFileSave = 1;
              //   break;
              // }
              // if (!moment(result[i].Next_Service, "DD/MM/YYYY", true).isValid()) {
              //   alert("please Enter a date in to the 'DD/MM/YYYY' formate in  Next Service");
              //   // assetFlagFileSave = 1;
              //   break;
              // }
              // if (!moment(result[i].Last_Service, "DD/MM/YYYY", true).isValid()) {
              //   alert("please Enter a date in to the 'DD/MM/YYYY' formate in  Last Service");
              //   // assetFlagFileSave = 1;
              //   break;
              // }
              // if (!moment(result[i].AMC_Expiry, "DD/MM/YYYY", true).isValid()) {
              //   alert("please Enter a date in to the 'DD/MM/YYYY' formate in  AMC Expiry");
              //   // assetFlagFileSave = 1;
              //   break;
              // }
              var source_Additions = new Sources({});
              source_Additions.user = Authentication.user._id;
              source_Additions.source_asset_id_no = result[i].Asset_Id;
              source_Additions.source_asset_type_id_no = result[i].Asset_type_Id;
              source_Additions.tag_id = result[i].Tag_Id;
              source_Additions.source_mfg_id_no = result[i].Manufacture_Id;
              source_Additions.source_model_id_no = result[i].Model_Id;
              source_Additions.source_sub_department_id_no = result[i].Sub_Department_Id;
              source_Additions.source_location_type_id = result[i].Location_type_Id;
              source_Additions.source_department_id_no = result[i].Department_Id;
              source_Additions.source_location_id = result[i].Location_Id;
              source_Additions.source_installation_date = result[i].Installation_Date;
              source_Additions.source_last_service = result[i].Last_Service;
              source_Additions.source_next_service = result[i].Next_Service;
              source_Additions.source_amc_expr = result[i].AMC_Expiry;
              source_Additions.source_user_id_no = result[i].User_Id;
              source_Additions.clientId = Authentication.user.lastName;
              // source_Additions.user_notify_to = result[i].User_Notify_To;
              source_Additions.user_notify_to = result[i].User_Notify_To;
              source_Additions.vendor_Company_id = result[i].Vendor_Company_Id;
              source_Additions.source_asset_type = result[i].Asset_Type;
              source_Additions.messageType = "AddSourceAddition";
              source_Additions.$save(function (response) {
                $scope.findSA();
                datatable_destroy2();
                initSA();
                $scope.clearSA();
              }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
              });
            }
          }
          // if (assetFlagFileSave == 0) {
          //   alert("inside save if");
          //   if (assetId.length == description.length) {
          //     if (!checkDuplicate_function(assetId)) {
          //       alert("inside save");
          //       var source_Asset_Update = new Sources({
          //         asset_type_id_no: $scope.asset_type_id_no,
          //         asset_type_id_des: $scope.asset_type_id_des
          //       });
          //       source_Asset_Update.user = Authentication.user._id;
          //       source_Asset_Update.clientId = Authentication.user.lastName;
          //       source_Asset_Update.index = assetIndex;
          //       source_Asset_Update.oldAssetType = object[0].asset_type_id_no[assetIndex];
          //       source_Asset_Update.messageType = "updateAssetDatafile";
          //       source_Asset_Update.asset_type_id_des = description;
          //       source_Asset_Update.asset_type_id_no = assetId;
          //       source_Asset_Update.id = object[0]._id;
          //       source_Asset_Update.$save(function (response) {
          //         console.log("inside Updating Asset Id");
          //         object = Sources.query();
          //         init();
          //         flag = 0;
          //         assetDataTable();
          //         $scope.clear();
          //         console.log(response);
          //       }, function (errorResponse) {
          //         $scope.error = errorResponse.data.message;
          //       });
          //     } else {
          //       alert("duplicate Asset type ID accured in the file")
          //     }
          //   } else if (assetId.length > description.length) {
          //     alert("please fill the proper data...!\n you are missing descriptions")
          //   } else if (assetId.length < description.length) {
          //     alert("please remove the unwanted description");
          //   }
          // }
        };
        reader.readAsArrayBuffer(f);
      }
    }



    function handleFile(e) {

      if (addDataFromFileFlag == 0) {
        alert("inside asset flag");
        var assetId = [],
          description = [];
        //Get the files from Upload control
        var files = e.target.files;
        var i, f;
        //Loop through files
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              //Convert the cell value to Json
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
                console.log(result);
              }
            });
            var assetFlagFileSave = 0;
            for (var i = 0; i < result.length; i++) {
              if (/\s/.test(result[i].AssetID)) {
                alert("please remove the space for asset id in line number " + (i + 2));
                assetFlagFileSave = 1;
              } else {
                if (result[i].AssetID === "" || result[i].AssetID === null /* ||result[i].AssetID!="" */ || result[i].Description === undefined) {
                  alert("plpease fill proper data");
                  assetFlagFileSave = 1;
                } else {
                  assetId[i] = result[i].AssetID;
                  description[i] = result[i].Description;
                  assetFlagFileSave = 0;
                }
              }
              if (object[0].asset_type_id_no.length !== 0) {
                if (checkDuplicate_functionsInTwoArray(object[0].asset_type_id_no, assetId)) {
                  alert("Duplcate Data ");
                  assetFlagFileSave = 1;
                } else {
                  alert("changed flag")
                  assetFlagFileSave = 0
                }
              }
            }
            if (assetFlagFileSave == 0) {
              alert("inside save if");
              if (assetId.length == description.length) {
                if (!checkDuplicate_function(assetId)) {
                  alert("inside save");
                  var source_Asset_Update = new Sources({
                    asset_type_id_no: $scope.asset_type_id_no,
                    asset_type_id_des: $scope.asset_type_id_des
                  });
                  source_Asset_Update.user = Authentication.user._id;
                  source_Asset_Update.clientId = Authentication.user.lastName;
                  source_Asset_Update.index = assetIndex;
                  source_Asset_Update.oldAssetType = object[0].asset_type_id_no[assetIndex];
                  source_Asset_Update.messageType = "updateAssetDatafile";
                  source_Asset_Update.asset_type_id_des = description;
                  source_Asset_Update.asset_type_id_no = assetId;
                  source_Asset_Update.id = object[0]._id;
                  source_Asset_Update.$save(function (response) {
                    console.log("inside Updating Asset Id");
                    object = Sources.query();
                    init();
                    flag = 0;
                    assetDataTable();
                    $scope.clear();
                    console.log(response);
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });
                } else {
                  alert("duplicate Asset type ID accured in the file")
                }
              } else if (assetId.length > description.length) {
                alert("please fill the proper data...!\n you are missing descriptions")
              } else if (assetId.length < description.length) {
                alert("please remove the unwanted description");
              }
            }
          };
          reader.readAsArrayBuffer(f);
        }
      }

      /**
       * 
       * Add Manufacture Data
       * 
       */
      else if (addDataFromFileFlag == 1) {
        alert("inside asset flag");
        var mfgId = [],
          description = [];
        //Get the files from Upload control
        var files = e.target.files;
        var i, f;
        //Loop through files
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              //Convert the cell value to Json
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });

            console.log("this is result");
            console.log(result);
            var assetFlagFileSave = 0;
            for (var i = 0; i < result.length; i++) {
              if (/\s/.test(result[i].ManufactureID)) {
                alert("please remove the space for Manufacture id in line number " + (i + 2));
                assetFlagFileSave = 1;
              } else {
                if (result[i].ManufactureID === "" || result[i].ManufactureID === null || result[i].ManufactureID === undefined || result[i].Description === "" || result[i].Description === undefined || result[i].Description === null) {
                  alert("please fill proper data");
                  assetFlagFileSave = 1;
                  // break;
                } else {
                  mfgId[i] = result[i].ManufactureID;
                  description[i] = result[i].Description;
                  assetFlagFileSave = 0;
                }
              }
              if (object[0].mfg_id_no.length !== 0) {
                if (checkDuplicate_functionsInTwoArray(object[0].mfg_id_no, mfgId)) {
                  alert("Duplcate Data  ");
                  assetFlagFileSave = 1;
                } else {
                  alert("changed flag");
                  assetFlagFileSave = 0
                }
              }
            }
            if ( assetFlagFileSave === 0 ) {
              alert("inside save");
              if (mfgId.length == description.length) {
                if (!checkDuplicate_function(mfgId)) {
                  var source_Manufacture_Update = new Sources({});
                  source_Manufacture_Update.user = Authentication.user._id;
                  source_Manufacture_Update.index = manufactureIndex;
                  source_Manufacture_Update.id = object[0]._id;
                  source_Manufacture_Update.messageType = "updateManufactureDataFile";
                  source_Manufacture_Update.mfg_id_des = description;
                  source_Manufacture_Update.mfg_id_no = mfgId;
                  source_Manufacture_Update.clientId = Authentication.user.lastName;
                  source_Manufacture_Update.$save(function (response) {
                    console.log("inside Updating manufacture Id");
                    object = Sources.query();
                    flag = 1;
                    init();
                    manufactureTable();
                    $scope.clear();
                    console.log(response);
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });

                } else {
                  alert("please download the template for Manufacture and fill data and upload the file");
                }
              } else if (assetId.length > description.length) {
                alert("please fill the proper data...!\n you are missing descriptions")
              } else
              if (assetId.length < description.length) {
                alert("please remove the unwanted description");
              }
            }
          };
          reader.readAsArrayBuffer(f);
        }
      }



      /**
       * 
       * Add Model Data
       * 
       */
      else if (addDataFromFileFlag == 2) {
        var mdlId = [],
          description = [];
        var files = e.target.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            console.log(result);
            var assetFlagFileSave = 0;
            if (typeof (result.ModelID) !== undefined || typeof (result.Description) !== undefined) {
              for (var i = 0; i < result.length; i++) {
                alert("inside for");
                if (/\s/.test(result[i].ModelID)) {
                  alert("please remove the space for Manufacture id in line number " + (i + 2));
                  assetFlagFileSave = 1;
                } else {
                  alert("inside put");
                  mdlId[i] = result[i].ModelID;
                  description[i] = result[i].Description;
                  assetFlagFileSave = i;
                }
              }
              alert(assetFlagFileSave);
              alert(result.length);
              if (assetFlagFileSave == (result.length - 1)) {
                alert("inside change flag");
                // if (object[0].model_id_no.length !== 0) {
                alert("inside duplicate check");
                if (checkDuplicate_functionsInTwoArray(object[0].model_id_no, mdlId)) {
                  alert("Duplcate Data  ");
                  assetFlagFileSave = 1;
                } else {
                  alert("changed flag");
                  assetFlagFileSave = 0
                }
                // }
                if (!checkDuplicate_function(mdlId) && assetFlagFileSave === 0) {
                  alert("inside save");
                  var source_Model_Update = new Sources({});
                  source_Model_Update.user = Authentication.user._id;
                  source_Model_Update.index = modelIndex;
                  source_Model_Update.id = object[0]._id;
                  source_Model_Update.messageType = "updateModelDatafile";
                  source_Model_Update.model_id_no = mdlId;
                  source_Model_Update.model_id_des = description;
                  source_Model_Update.clientId = Authentication.user.lastName;
                  // alert("inside model update "+modelIndex);
                  source_Model_Update.$save(function (response) {
                    object = Sources.query();
                    init();
                    flag = 2;
                    modelTable();
                    $scope.clear();
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });
                }
              }
            } else {
              alert("please download the template for Manufacture and fill data and upload the file");
            }
          };
          reader.readAsArrayBuffer(f);
        }
       }/*  else if (addDataFromFileFlag == 3) { */
      //   alert("inside department");
        
      //   var departmentId = [],
      //     description = [];
      //   var files = e.target.files;
      //   console.log(files);
      //   var i, f;

      //   for (i = 0, f = files[i]; i != files.length; ++i) {
      //     alert("inside for loop");
      //     var reader = new FileReader();
      //     var name = f.name;
      //     reader.onload = function (e) {
      //     alert("inside onload loop");
            
      //       var data = e.target.result;
      //       var result;
      //       var workbook = XLSX.read(data, {
      //         type: 'binary'
      //       });
      //       var sheet_name_list = workbook.SheetNames;
      //       sheet_name_list.forEach(function (y) { /* iterate through sheets */
      //         var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
      //         if (roa.length > 0) {
      //           result = roa;
      //         }
      //       });
      //       var assetFlagFileSave = 0;
      //       if (typeof (result.DepartmentID) !== undefined || typeof (result.Description) !== undefined) {
      //         for (var i = 0; i < result.length; i++) {
      //           if (/\s/.test(result[i].DepartmentID)) {
      //             alert("please remove the space for Manufacture id in line number " + (i + 2));
      //             assetFlagFileSave = 1;
      //           } else {
      //             departmentId[i] = result[i].DepartmentID;
      //             description[i] = result[i].Description;
      //             assetFlagFileSave = i;
      //           }
      //         }
      //         if (assetFlagFileSave == (result.length - 1)) {
      //           // if (object[0].sub_department_id_no.length !== 0) {
      //           alert("inside duplicate check");
      //           if (checkDuplicate_functionsInTwoArray(object[0].department_id_no, departmentId)) {
      //             alert("Duplcate Data  ");
      //             assetFlagFileSave = 1;
      //           } else {
      //             alert("changed flag")
      //             assetFlagFileSave = 0
      //           }

      //           // }
      //           if (!checkDuplicate_function(departmentId) && assetFlagFileSave === 0) {
      //             var source_Department_Update = new Sources({});
      //             source_Department_Update.user = Authentication.user._id;
      //             source_Department_Update.index = deptIndex;
      //             source_Department_Update.id = object[0]._id;
      //             source_Department_Update.oldAssetType = object[0].department_id_no[deptIndex];
      //             source_Department_Update.messageType = "updateDepartmentDatafile";
      //             source_Department_Update.department_id_no = departmentId;
      //             source_Department_Update.department_id_dec = description;
      //             source_Department_Update.clientId = Authentication.user.lastName;
      //             source_Department_Update.$save(function (response) {
      //               console.log("inside Updating Employee Id");
      //               object = Sources.query();
      //               init();
      //               flag = 4;
      //               departmentTable();
      //               $scope.clear();
      //               console.log(response);
      //             }, function (errorResponse) {
      //               $scope.error = errorResponse.data.message;
      //             });
      //           }
      //         } else {
      //           alert("please download the template for Department and fill data and upload the file");
      //         }
      //       };
      //       reader.readAsArrayBuffer(f);
      //     }
      //   }
      /* } */ 
      
      else if (addDataFromFileFlag == 3) {
        var departmentId = [],
          description = [];
        var files = e.target.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            var assetFlagFileSave = 0;
            if (typeof (result.DepartmentID) !== undefined || typeof (result.Description) !== undefined) {
              for (var i = 0; i < result.length; i++) {
                if (/\s/.test(result[i].DepartmentID)) {
                  alert("please remove the space for Manufacture id in line number " + (i + 2));
                  assetFlagFileSave = 1;
                } else {
                  departmentId[i] = result[i].DepartmentID;
                  description[i] = result[i].Description;
                  assetFlagFileSave = i;
                }
              }
              if (assetFlagFileSave == (result.length - 1)) {
                // if (object[0].sub_department_id_no.length !== 0) {
                alert("inside duplicate check");
                if (checkDuplicate_functionsInTwoArray(object[0].department_id_no, departmentId)) {
                  alert("Duplcate Data  ");
                  assetFlagFileSave = 1;
                } else {
                  alert("changed flag")
                  assetFlagFileSave = 0
                }
                // }
                if ( assetFlagFileSave === 0) {
                  console.log(departmentId);
                  console.log(description);
                  
                  // var source_SubDepartment_Update = new Sources({

                  // });
                  // source_SubDepartment_Update.user = Authentication.user._id;
                  // source_SubDepartment_Update.index = sDeptIndex;
                  // source_SubDepartment_Update.id = object[0]._id;
                  // source_SubDepartment_Update.oldAssetType = object[0].sub_department_id_no[sDeptIndex];
                  // source_SubDepartment_Update.messageType = "updateSubDepartmentDatafile";
                  // source_SubDepartment_Update.sub_department_id_no = subDepartmentId;
                  // source_SubDepartment_Update.sub_department_id_dec = description;
                  // source_SubDepartment_Update.clientId = Authentication.user.lastName;
                  // source_SubDepartment_Update.$save(function (response) {
                  //   object = Sources.query();
                  //   init();
                  //   flag = 5;
                  //   subDepartmentTable();
                  //   $scope.clear();
                  // }, function (errorResponse) {
                  //   $scope.error = errorResponse.data.message;
                  // });

                  var source_Department_Update = new Sources({});
                  source_Department_Update.user = Authentication.user._id;
                  source_Department_Update.index = deptIndex;
                  source_Department_Update.id = object[0]._id;
                  source_Department_Update.oldAssetType = object[0].department_id_no[deptIndex];
                  source_Department_Update.messageType = "updateDepartmentDatafile";
                  source_Department_Update.department_id_no = departmentId;
                  source_Department_Update.department_id_dec = description;
                  source_Department_Update.clientId = Authentication.user.lastName;
                  source_Department_Update.$save(function (response) {
                    console.log("inside Updating Employee Id");
                    object = Sources.query();
                    init();
                    flag = 4;
                    departmentTable();
                    $scope.clear();
                    console.log(response);
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });



                }
              } else {
                alert("please download the template for Sub Department and fill data and upload the file");

              }
            }
          };
          reader.readAsArrayBuffer(f);
        }
      }
      
      
      else if (addDataFromFileFlag == 4) {
        var subDepartmentId = [],
          description = [];
        var files = e.target.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            var assetFlagFileSave = 0;
            if (typeof (result.SubDepartmentID) !== undefined || typeof (result.Description) !== undefined) {
              for (var i = 0; i < result.length; i++) {
                if (/\s/.test(result[i].SubDepartmentID)) {
                  alert("please remove the space for Manufacture id in line number " + (i + 2));
                  assetFlagFileSave = 1;
                } else {
                  subDepartmentId[i] = result[i].SubDepartmentID;
                  description[i] = result[i].Description;
                  assetFlagFileSave = i;
                }
              }
              if (assetFlagFileSave == (result.length - 1)) {
                // if (object[0].sub_department_id_no.length !== 0) {
                alert("inside duplicate check");
                if (checkDuplicate_functionsInTwoArray(object[0].sub_department_id_no, subDepartmentId)) {
                  alert("Duplcate Data  ");
                  assetFlagFileSave = 1;
                } else {
                  alert("changed flag")
                  assetFlagFileSave = 0
                }
                // }
                if (!checkDuplicate_function(subDepartmentId) && assetFlagFileSave === 0) {
                  var source_SubDepartment_Update = new Sources({

                  });
                  source_SubDepartment_Update.user = Authentication.user._id;
                  source_SubDepartment_Update.index = sDeptIndex;
                  source_SubDepartment_Update.id = object[0]._id;
                  source_SubDepartment_Update.oldAssetType = object[0].sub_department_id_no[sDeptIndex];
                  source_SubDepartment_Update.messageType = "updateSubDepartmentDatafile";
                  source_SubDepartment_Update.sub_department_id_no = subDepartmentId;
                  source_SubDepartment_Update.sub_department_id_dec = description;
                  source_SubDepartment_Update.clientId = Authentication.user.lastName;
                  source_SubDepartment_Update.$save(function (response) {
                    object = Sources.query();
                    init();
                    flag = 5;
                    subDepartmentTable();
                    $scope.clear();
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });
                }
              } else {
                alert("please download the template for Sub Department and fill data and upload the file");

              }
            }
          };
          reader.readAsArrayBuffer(f);
        }
      } else if (addDataFromFileFlag == 5) {
        var priorityId = [],
          description = [];
        var files = e.target.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            var assetFlagFileSave = 0;
            if (typeof (result.PriorityID) !== undefined || typeof (result.Description) !== undefined) {
              for (var i = 0; i < result.length; i++) {
                if (/\s/.test(result[i].priorityId)) {
                  alert("please remove the space for Manufacture id in line number " + (i + 2));
                  assetFlagFileSave = 1;
                } else {
                  priorityId[i] = result[i].PriorityID;
                  description[i] = result[i].Description;
                  assetFlagFileSave = i;
                }
              }
              if (assetFlagFileSave == (result.length - 1)) {
                // if (object[0].priority_id_no.length !== 0) {
                alert("inside duplicate check");
                if (checkDuplicate_functionsInTwoArray(object[0].priority_id_no, priorityId)) {
                  alert("Duplcate Data  ");
                  assetFlagFileSave = 1;
                } else {
                  alert("changed flag")
                  assetFlagFileSave = 0
                }
                // }
                if (!checkDuplicate_function(priorityId) && assetFlagFileSave === 0) {
                  var source_priority_Update = new Sources({

                  });
                  source_priority_Update.user = Authentication.user._id;
                  source_priority_Update.index = priorityIndex;
                  source_priority_Update.id = object[0]._id;
                  source_priority_Update.messageType = "updatePriorityDatafile";
                  source_priority_Update.priority_id_no = priorityId;
                  source_priority_Update.priority_id_dec = description;
                  source_priority_Update.clientId = Authentication.user.lastName;
                  source_priority_Update.$save(function (response) {
                    console.log("inside Updating Priority Id");
                    object = Sources.query();
                    init();
                    flag = 6;
                    priorityTable();
                    $scope.clear();
                    console.log(response);
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });
                }
              }
            } else {
              alert("please download the template for Priority and fill data and upload the file");

            }
          };
          reader.readAsArrayBuffer(f);
        }
      } else if (addDataFromFileFlag == 6) {
        var rollId = [],
          description = [],
          rollTimeMultiplier = [];
        var files = e.target.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            var assetFlagFileSave = 0;
            if (typeof (result.RollID) !== undefined || typeof (result.Description) !== undefined) {
              for (var i = 0; i < result.length; i++) {
                if (/\s/.test(result[i].RollID)) {
                  alert("please remove the space for Manufacture id in line number " + (i + 2));
                  assetFlagFileSave = 1;
                } else {
                  rollId[i] = result[i].RollID;
                  description[i] = result[i].Description;
                  rollTimeMultiplier[i] = result[i].RollTImeMultiplier;
                  assetFlagFileSave = i;
                }
              }
              if (assetFlagFileSave == (result.length - 1)) {
                // if (object[0].roll_id_no.length !== 0) {
                alert("inside duplicate check");
                if (checkDuplicate_functionsInTwoArray(object[0].roll_id_no, rollId)) {
                  alert("Duplcate Data  ");
                  assetFlagFileSave = 1;
                } else {
                  alert("changed flag")
                  assetFlagFileSave = 0
                  // }
                }
                if (!checkDuplicate_function(rollId) && assetFlagFileSave === 0) {
                  var source_Roll_Update = new Sources({

                  });
                  source_Roll_Update.user = Authentication.user._id;
                  source_Roll_Update.index = rollIndex;
                  source_Roll_Update.id = object[0]._id;
                  source_Roll_Update.messageType = "updateRollDatafile";
                  source_Roll_Update.roll_id_no = rollId;
                  source_Roll_Update.roll_id_desc = description;
                  source_Roll_Update.roll_time_multiplier = rollTimeMultiplier;
                  source_Roll_Update.clientId = Authentication.user.lastName;
                  source_Roll_Update.$save(function (response) {
                    object = Sources.query();
                    init();
                    flag = 7;
                    rollTable();
                    $scope.clear();
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });
                }
              }
            } else {
              alert("please download the template for Roll and fill data and upload the file");
            }
          };
          reader.readAsArrayBuffer(f);
        }
      } else if (addDataFromFileFlag == 7) {
        var locId = [],
          description = [];
        var files = e.target.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            var assetFlagFileSave = 0;
            if (typeof (result.LocationTypeID) !== undefined || typeof (result.Description) !== undefined) {
              for (var i = 0; i < result.length; i++) {
                if (/\s/.test(result[i].LocationTypeID)) {
                  alert("please remove the space for Manufacture id in line number " + (i + 2));
                  assetFlagFileSave = 1;
                } else {
                  locId[i] = result[i].LocationTypeID;
                  description[i] = result[i].Description;
                  assetFlagFileSave = i;
                }
              }
              if (assetFlagFileSave == (result.length - 1)) {
                // if (object[0].sub_department_id_no.length !== 0) {
                alert("inside duplicate check");
                if (checkDuplicate_functionsInTwoArray(object[0].location_type_id, locId)) {
                  alert("Duplcate Data  ");
                  assetFlagFileSave = 1;
                } else {
                  alert("changed flag")
                  assetFlagFileSave = 0
                  // }
                }
                if (!checkDuplicate_function(locId) && assetFlagFileSave === 0) {
                  var source_LocationType_Update = new Sources({

                  });
                  source_LocationType_Update.user = Authentication.user._id;
                  source_LocationType_Update.index = locTyIndex;
                  source_LocationType_Update.id = object[0]._id;
                  source_LocationType_Update.messageType = "updateLocationTypeDatafile";
                  source_LocationType_Update.location_type_id = locId;
                  source_LocationType_Update.location_type_id_desc = description;
                  source_LocationType_Update.clientId = Authentication.user.lastName;
                  source_LocationType_Update.$save(function (response) {
                    console.log("inside Updating Priority Id");
                    object = Sources.query();
                    init();
                    flag = 8;
                    locationTable();
                    $scope.clear();
                    console.log(response);
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });
                }
              }
            } else {
              alert("please download the template for Roll and fill data and upload the file");
            }
          };
          reader.readAsArrayBuffer(f);
        }
      } else if (addDataFromFileFlag == 8) {
        var locId = [],
          locname = [],
          locType = [],
          long = [],
          lat = [],
          gmtD = [],
          undrLoc = [];
        var files = e.target.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            var assetFlagFileSave = 0;
            if (typeof (result.LocationID) !== undefined || typeof (result.Description) !== undefined) {

              for (var i = 0; i < result.length; i++) {
                if (/\s/.test(result[i].LocationID)) {
                  alert("please remove the space for Manufacture id in line number " + (i + 2));
                  assetFlagFileSave = 1;
                } else {
                  locId[i] = result[i].LocationID;
                  locname[i] = result[i].Name;
                  locType[i] = result[i].LocationType;
                  long[i] = result[i].Longitude;
                  lat[i] = result[i].Latitude;
                  gmtD[i] = result[i].GMT_Different;
                  undrLoc[i] = result[i].UnderLocation;
                  assetFlagFileSave = i;
                }
              }
              if (!checkDuplicate_functionsInTwoArray(object[0].location_type_id, locType)) {
                alert("plase add data first in configuration page");
                assetFlagFileSave = 1;
              } else if (assetFlagFileSave == (result.length - 1)) {
                if (object[0].location_id.length !== 0) {
                  alert("inside duplicate check");
                  if (checkDuplicate_functionsInTwoArray(locId, object[0].location_id)) {
                    alert("Duplcate Data  ");
                    assetFlagFileSave = 1;
                  } else {
                    alert("changed flag")
                    assetFlagFileSave = 0
                  }
                }
                // if (object[0].location_type_id.containsArray(locType)) {
                //   alert("true");
                // }
                if(assetFlagFileSave==0){
                  var source_Location_Update = new Sources({

                  });
                  source_Location_Update.user = Authentication.user._id;
                  source_Location_Update.index = locIndex;
                  source_Location_Update.id = object[0]._id;
                  source_Location_Update.messageType = "updateLocationDatafile";
                  source_Location_Update.location_id = locId;
                  source_Location_Update.name_of_the_location = locname;
                  source_Location_Update.location_type_id2 = locType;
                  source_Location_Update.longitude = long;
                  source_Location_Update.latitude = lat;
                  source_Location_Update.gmt_different = gmtD;
                  source_Location_Update.under_location = undrLoc;
                  source_Location_Update.clientId = Authentication.user.lastName;
                  source_Location_Update.$save(function (response) {
                    object = Sources.query();
                    init();
                    flag = 9;
                    location2table();
                    $scope.clear();
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });
                  
                }
                
              }

            } else {
              alert("please download the template for Roll and fill data and upload the file");
            }
          };
          reader.readAsArrayBuffer(f);
        }
      } else if (addDataFromFileFlag == 13) {
        var shift = [],
          to = [],
          from = [];
        var files = e.target.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            var assetFlagFileSave = 0;
            if (typeof (result.Shift) !== undefined || typeof (result.From) !== undefined || typeof (result.To) !== undefined) {

              for (var i = 0; i < result.length; i++) {
                if (/\s/.test(result[i].VendorCompanyId)) {
                  alert("please remove the space for Manufacture id in line number " + (i + 2));
                  assetFlagFileSave = 1;
                } else {
                  shift[i] = result[i].Shift;
                  from[i] = result[i].From;
                  to[i] = result[i].To;
                  assetFlagFileSave = i;
                }
                if (assetFlagFileSave == (result.length - 1)) {
                  var source_Shift_Update = new Sources({});
                  source_Shift_Update.user = Authentication.user._id;
                  source_Shift_Update.index = shiftIndex;
                  source_Shift_Update.id = object[0]._id;
                  source_Shift_Update.messageType = "updateShiftDatafile";
                  source_Shift_Update.to = to;
                  source_Shift_Update.from = from;
                  source_Shift_Update.shifts = shift;
                  source_Shift_Update.clientId = Authentication.user.lastName;
                  source_Shift_Update.$save(function (response) {
                    // alert("inside Updating manufacture Id");
                    object = Sources.query();
                    flag = 15;
                    init();
                    shiftsTable();
                    $scope.clear();

                    // object=response;
                    console.log(response);
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });
                }
              }
            } else {
              alert("please download the template for Roll and fill data and upload the file");
            }
          };
          reader.readAsArrayBuffer(f);
        }
      } else if (addDataFromFileFlag == 12) {
        // alert("inside add manufacture");
        var vendorId = [],
          venname = [],
          vendesc = [],
          email = [],
          venPhone = [];
        //Get the files from Upload control
        var files = e.target.files;
        var i, f;
        //Loop through files
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              //Convert the cell value to Json
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            var assetFlagFileSave = 0;
            //Get the first column first cell value
            console.log(result);
            //  console.log("this is asset "+object[0].asset_type_id_no.length);
            if (typeof (result.VendorCompanyId) !== undefined || typeof (result.VendorName) !== undefined || typeof (result.VendorEmail) !== undefined) {

              for (var i = 0; i < result.length; i++) {
                //  console.log(result[i].priorityId);
                //  console.log(result[i].Description);
                //  alert("inside for loop");
                // assetId[i]=result[i].AssetID;
                if (/\s/.test(result[i].VendorCompanyId)) {
                  alert("please remove the space for Manufacture id in line number " + (i + 2));
                  // i++;
                  assetFlagFileSave = 1;
                  // It has any kind of whitespace
                }
                //   else if(object[0].mfg_id_no.length!==0){
                //     alert("inside duplicate check");
                //    if(mfgData[i][0]==result[i].ManufactureID){
                //     alert("Duplcate Data in line number "+(i+1));
                //     assetFlagFileSave=1;
                //     break;
                //   }
                // }
                else {
                  vendorId[i] = result[i].VendorCompanyId;
                  venname[i] = result[i].VendorName;
                  vendesc[i] = result[i].VendorDescription;
                  email[i] = result[i].VendorEmail;
                  venPhone[i] = result[i].VendorPhone;
                  // gmtD[i]=result[i].GMT_Different;
                  // undrLoc[i]=result[i].UnderLocation;
                  // rollTimeMultiplier[i]=result[i].RollTImeMultiplier;
                  assetFlagFileSave = i;
                  // alert(assetFlagFileSave);
                }
              }
              if (assetFlagFileSave == (result.length - 1)) {
                // alert("inside save");
                //  console.log()
                //  console.log(departmentId);
                //  console.log(description);

                // if (object[0].vendor_id.length !== 0) {
                alert("inside duplicate check");
                if (checkDuplicate_functionsInTwoArray(object[0].vendor_id, vendorId)) {
                  alert("Duplcate Data  ");
                  assetFlagFileSave = 1;
                  // break;
                } else {
                  alert("changed flag")
                  assetFlagFileSave = 0
                }
                // }
                if (!checkDuplicate_function(vendorId) && assetFlagFileSave === 0) {
                  var vendor = new Sources({});
                  // alert("");
                  vendor.user = Authentication.user._id;
                  vendor.clientId = Authentication.user.lastName;

                  // alert(Authentication.user._id);
                  vendor.index = vendorIndex;
                  // source_Asset_Update.id=object[0]._id;
                  // vendor.vendor_id=object[0].asset_type_id_no[assetIndex];
                  vendor.messageType = "updateVendorDatafile";
                  vendor.vendor_id = vendorId;
                  vendor.vendor_description = vendesc;
                  vendor.vendor_name = venname;
                  vendor.vendor_phone = venPhone;
                  vendor.vendor_email = email;
                  vendor.id = object[0]._id;
                  // alert("inside asset update "+assetIndex);
                  vendor.$save(function (response) {
                    console.log("inside Updating Asset Id");
                    // object=response;
                    object = Sources.query();
                    init();
                    flag = 20;
                    // assetDataTable();
                    $scope.clear();
                    console.log(response);
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });
                }
              }
            } else {
              alert("please download the template for Roll and fill data and upload the file");

            }
          };
          reader.readAsArrayBuffer(f);
        }
      } else if (addDataFromFileFlag == 10) {
        // alert("inside add manufacture");
        var prblmId = [],
          description = [],
          priorityType = [],
          prblmTime = [],
          notificationRemainder = [],
          escalationLavel = [],
          escalationTime = [],
          comment_Header=[],
          comment_Prefix=[],
          comment_Suffix=[],
          comment=[];
        //Get the files from Upload control
        var files = e.target.files;
        var i, f;
        //Loop through files
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              //Convert the cell value to Json
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            var assetFlagFileSave = 0;
            //Get the first column first cell value
            console.log(result);
            //  console.log("this is asset "+object[0].asset_type_id_no.length);
            if (typeof (result.ProblemID) !== undefined || typeof (result.Description) !== undefined || typeof (result.PriorityType) !== undefined) {
              console.log("inside if condition");
              for (var i = 0; i < result.length; i++) {
                //  console.log(result[i].priorityId);
                //  console.log(result[i].Description);
                //  alert("inside for loop");
                // assetId[i]=result[i].AssetID;
                if (/\s/.test(result[i].prblmId)) {
                  alert("please remove the space for Manufacture id in line number " + (i + 2));
                  // i++;
                  assetFlagFileSave = 1;
                  // It has any kind of whitespace
                }
                //   else if(object[0].mfg_id_no.length!==0){
                //     alert("inside duplicate check");
                //    if(mfgData[i][0]==result[i].ManufactureID){
                //     alert("Duplcate Data in line number "+(i+1));
                //     assetFlagFileSave=1;
                //     break;
                //   }
                // }
                else {
                  prblmId[i] = result[i].ProblemID;
                  description[i] = result[i].Description;
                  priorityType[i] = result[i].PriorityType;
                  prblmTime[i] = result[i].Problem_Time_in_Hour;
                  notificationRemainder[i] = result[i].Notification_Remainder_In_Minute;
                  // gmtD[i]=result[i].GMT_Different;
                  escalationLavel[i] = result[i].Escalation_Lavel;
                  escalationTime[i] = result[i].Escalation_Time_In_Hours;
                  comment_Header[i]=result[i].comment_Header;
                  comment_Suffix[i]=result[i].Comment_Suffix;
                  comment_Prefix[i]=result[i].Comment_prefix;
                  comment[i]=result[i].Comment;
                  // undrLoc[i]=result[i].UnderLocation;
                  // rollTimeMultiplier[i]=result[i].RollTImeMultiplier;
                  assetFlagFileSave = i;
                  // alert(assetFlagFileSave);
                }
              }
              if (checkDuplicate_functionsInTwoArray(object[0].problem_id_no, prblmId)) {
                console.log("inside check array function ");
                // alert("plase add data in configuration page");
                assetFlagFileSave = 1;
              } else if (assetFlagFileSave == (result.length - 1)) {
                alert("inside else ");
                if (object[0].problem_id_no.length !== 0) {
                  alert("inside duplicate check");
                  console.log(prblmId);
                  if (checkDuplicate_functionsInTwoArray(object[0].problem_id_no, prblmId)) {
                    alert("Duplcate Data  ");
                    assetFlagFileSave = 1;
                    // break;
                  } else {
                    alert("changed flag")
                    assetFlagFileSave = 0
                  }
                }
                // alert("inside save");
                //  console.log()
                //  console.log(departmentId);
                //  console.log(description);
                if ( assetFlagFileSave === 0) {
                  alert("inside save")
                  var source_Employee_Update = new Sources({

                  });
                  // alert(user);
                  source_Employee_Update.user = Authentication.user._id;
                  source_Employee_Update.index = problemIndex;
                  source_Employee_Update.id = object[0]._id;
                  source_Employee_Update.oldAssetType = object[0].problem_id_no[employeeIndex];
                  source_Employee_Update.messageType = "updateProblemDatafile";
                  source_Employee_Update.problem_id_no = prblmId;
                  source_Employee_Update.problem_id_desc = description;
                  source_Employee_Update.escalation_hrs = escalationTime;
                  source_Employee_Update.problem_time = prblmTime;
                  source_Employee_Update.escalation_level = escalationLavel;
                  source_Employee_Update.notification_policy_reminder = notificationRemainder;
                  source_Employee_Update.priority_id_no2 = priorityType;
                  source_Employee_Update.comment_Header = comment_Header;
                  source_Employee_Update.comment_Prefix = comment_Prefix;
                  source_Employee_Update.comment_Suffix = comment_Suffix;
                  source_Employee_Update.comment = comment;
                  source_Employee_Update.clientId = Authentication.user.lastName;
                  source_Employee_Update.$save(function (response) {
                    console.log("inside Updating Employee Id");
                    // object=response;
                    object = Sources.query();
                    init();
                    flag = 10;
                    problemtable();
                    $scope.clear();

                    console.log(response);
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });
                }
              }
            } else {
              alert("please download the template for Roll and fill data and upload the file");
            }
          };
          reader.readAsArrayBuffer(f);
        }
      } else if (addDataFromFileFlag == 11) {
        // alert("inside add manufacture");
        var astTypeId = [],
          problem = [];
        //Get the files from Upload control
        var files = e.target.files;
        var i, f;
        //Loop through files
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              //Convert the cell value to Json
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            var assetFlagFileSave = 0;
            //Get the first column first cell value
            console.log(result);
            //  console.log("this is asset "+object[0].asset_type_id_no.length);
            if (typeof (result.AssetTypeId) !== undefined || typeof (result.Problems) !== undefined) {

              for (var i = 0; i < result.length; i++) {
                //  console.log(result[i].priorityId);
                //  console.log(result[i].Description);
                //  alert("inside for loop");
                // assetId[i]=result[i].AssetID;
                if (/\s/.test(result[i].AssetTypeId)) {
                  alert("please remove the space for Manufacture id in line number " + (i + 2));
                  // i++;
                  assetFlagFileSave = 1;
                  // It has any kind of whitespace
                }
                //   else if(object[0].mfg_id_no.length!==0){
                //     alert("inside duplicate check");
                //    if(mfgData[i][0]==result[i].ManufactureID){
                //     alert("Duplcate Data in line number "+(i+1));
                //     assetFlagFileSave=1;
                //     break;
                //   }
                // }
                else {
                  astTypeId[i] = result[i].AssetTypeId;
                  problem[i] = result[i].Problems;
                  // priorityType[i]=result[i].PriorityType;
                  // prblmTime[i]=result[i].Problem_Time_in_Hour;
                  // notificationRemainder[i]=result[i].Notification_Remainder_In_Minute;
                  // // gmtD[i]=result[i].GMT_Different;
                  // escalationLavel[i]=result[i].Escalation_Lavel;
                  // escalationTime[i]=result[i].Escalation_Time_In_Hours;

                  // undrLoc[i]=result[i].UnderLocation;
                  // rollTimeMultiplier[i]=result[i].RollTImeMultiplier;
                  assetFlagFileSave = i;
                  // alert(assetFlagFileSave);
                }

                if (assetFlagFileSave == (result.length - 1)) {
                  // alert("inside save");
                  //  console.log()
                  //  console.log(departmentId);
                  //  console.log(description);
                  var source_Escalation_Update = new Sources({});
                  // alert(user);
                  source_Escalation_Update.user = Authentication.user._id;
                  source_Escalation_Update.index = assetMappingIndex;
                  source_Escalation_Update.id = object[0]._id;
                  var checkAssetMpng;
                  // source_Manufacture_Update.oldAssetType=object[0].asset_type_id_no[assetIndex];
                  source_Escalation_Update.messageType = "updateAssetMappingDatafile";
                  source_Escalation_Update.problem_asset_mapping_asset_type_id = astTypeId;
                  source_Escalation_Update.problem_asset_mapping_problem = problem;
                  // source_Escalation_Update.escalation_reassignment=$scope.escalation_reassignment;
                  source_Escalation_Update.clientId = Authentication.user.lastName;
                  // alert("inside asset update "+manufactureIndex);
                  source_Escalation_Update.$save(function (response) {
                    // alert("inside Updating manufacture Id");
                    object = Sources.query();
                    flag = 13;
                    init();
                    problemAssetMapping();
                    // object=response;
                    $scope.clear();

                    console.log(response);
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });

                }
              }
            } else {
              alert("please download the template for Roll and fill data and upload the file");

            }
          };
          reader.readAsArrayBuffer(f);
        }
      } else if (addDataFromFileFlag == 9) {
        // alert("inside add manufacture");
        var userId = [],
          u_Name = [],
          clientId = [],
          userName = [],
          description = [],
          mobile = [],
          email = [],
          roll = [],
          reportingTo = [],
          userType = [],
          mobilePrivacy = [],
          accountStatus = [],
          adminType = [],
          technicianType = [];

        //Get the files from Upload control
        var files = e.target.files;
        var i, f;
        //Loop through files
        for (i = 0, f = files[i]; i != files.length; ++i) {
          var reader = new FileReader();
          var name = f.name;
          reader.onload = function (e) {
            var data = e.target.result;
            var result;
            var workbook = XLSX.read(data, {
              type: 'binary'
            });
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) { /* iterate through sheets */
              //Convert the cell value to Json
              var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
              if (roa.length > 0) {
                result = roa;
              }
            });
            var assetFlagFileSave = 0;
            //Get the first column first cell value
            console.log(result);
            //  console.log("this is asset "+object[0].asset_type_id_no.length);
            if (typeof (result.UserID) !== undefined || typeof (result.userName) !== undefined) {

              for (var i = 0; i < result.length; i++) {
                //  console.log(result[i].priorityId);
                //  console.log(result[i].Description);
                //  alert("inside for loop");
                // assetId[i]=result[i].AssetID;
                if (/\s/.test(result[i].UserID) || /\s/.test(result[i].userName)) {
                  alert("please remove the space");
                  // i++;
                  assetFlagFileSave = 1;
                  // It has any kind of whitespace
                }
                //   else if(object[0].mfg_id_no.length!==0){
                //     alert("inside duplicate check");
                //    if(mfgData[i][0]==result[i].ManufactureID){
                //     alert("Duplcate Data in line number "+(i+1));
                //     assetFlagFileSave=1;
                //     break;
                //   }
                // }
                else {
                  userId[i] = result[i].UserID;
                  u_Name[i] = result[i].Name;
                  userName[i] = result[i].userName;
                  description[i] = result[i].Description;
                  mobile[i] = '9766999425';
                  email[i] = result[i].Email;
                  roll[i] = result[i].Roll;
                  reportingTo[i] = result[i].Reporting_To;
                  userType[i] = true;
                  adminType[i] = false;
                  technicianType[i] = false;
                  clientId[i] = Authentication.user.lastName;
                  accountStatus[i] = "Enable";
                  mobilePrivacy[i] = true;
                  assetFlagFileSave = i;

                  // alert(assetFlagFileSave);
                }
              }
              // if (!checkDuplicate_functionsInTwoArray(object[0].user_id_no, reportingTo) || !checkDuplicate_functionsInTwoArray(object[0].roll_id_no, roll)) {
              //   alert("plase add data first in configuration page");
              //   assetFlagFileSave = 1;
              // } else if (assetFlagFileSave == (result.length - 1)) {
              //   if (object[0].user_id_no.length !== 0) {
              //     alert("inside duplicate check");
              //     if (checkDuplicate_functionsInTwoArray(object[0].user_id_no, userId) || checkDuplicate_functionsInTwoArray(object[0].user_username, userName) || checkDuplicate_functionsInTwoArray(object[0].user_email, email)) {
              //       alert("Duplcate Data  ");
              //       assetFlagFileSave = 1;
              //       // break;
              //     } else {
              //       alert("changed flag")
              //       assetFlagFileSave = 0
              //     }
              //   }
                assetFlagFileSave = 0;
              
                if (/* !checkDuplicate_function(userId) || !checkDuplicate_function(userName) || !checkDuplicate_function(email) && */ assetFlagFileSave === 0) {
                  // if (!checkDuplicate_function(userId) || !checkDuplicate_function(userName) || !checkDuplicate_function(email) && assetFlagFileSave === 0) {

                  // alert("inside save");
                  //  console.log()
                  //  console.log(departmentId);
                  //  console.log(description);
                  var credentials = new Sources({
                    firstName: this.firstName,
                    lastName: this.lastName,
                    tag_id: this.tag_id,
                    mobile: this.mobile,
                    email: this.email,
                    username: this.username,
                    description: this.description,
                    password: this.password,
                    roles: this.roles,
                    user: this.user,
                    status: this.status
                  });

                  credentials.user = Authentication.user._id;
                  credentials.clientId = Authentication.user.clientId;
                  credentials.messageType2 = "adnewwUser";
                  credentials.firstName = userId;
                  credentials.lastName = "AK";
                  credentials.mobile = 9766999425;
                  credentials.email = email;
                  credentials.username = userName;
                  credentials.status = accountStatus;
                  credentials.roles = ["user"];
                  credentials.description = description;
                  credentials.password = generatePassword(10);
                  credentials.$save(function (response) {
                    alert("saved");
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });

                  var source_User_Update = new Sources({});
                  source_User_Update.user = Authentication.user._id;
                  source_User_Update.index = userIndex;
                  source_User_Update.id = object[0]._id;
                  source_User_Update.findUser = findUser;
                  source_User_Update.messageType = "updateUserDatafile";
                  source_User_Update.user_id_no = userId;
                  source_User_Update.user_first_name = u_Name;
                  source_User_Update.user_last_name = clientId;
                  source_User_Update.user_username = userName;
                  source_User_Update.user_id_desc = description;
                  source_User_Update.user_reporting = reportingTo;
                  source_User_Update.roll_id_no2 = roll;
                  source_User_Update.user_roll_admin = adminType;
                  source_User_Update.user_roll_technician = technicianType;
                  source_User_Update.user_roll_user = userType;
                  source_User_Update.user_mobile_privacy = mobilePrivacy;
                  source_User_Update.user_mobile = mobile;
                  source_User_Update.user_email = email;
                  source_User_Update.user_status = accountStatus;
                  source_User_Update.clientId = Authentication.user.lastName;
                  source_User_Update.$save(function (response) {
                    object = Sources.query();
                    init();
                    flag = 11;
                    usertable();
                    $scope.clear();
                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });

                }
              }
            // } else {
            //   alert("please download the template for Roll and fill data and upload the file");

            // }
          };
          reader.readAsArrayBuffer(f);
        }
      }
    }

    //Change event to dropdownlist
    $(document).ready(function () {
      $('#files').change(handleFile);
      $('#files2').change(sourceAddtion);

    });


    $scope.editDisable = function () {
      // alert('inside change');
      $scope.edit = false;
      // if ($scope.user_id_no === undefined || $scope.user_first_name === undefined || $scope.user_username === undefined || $scope.user_id_desc === undefined || $scope.user_mobile === undefined) {
      //   $scope.edit = true;
      // }
    }

    $scope.editDisable2 = function () {
      // alert('inside change');
      $scope.edit = false;
      if ($scope.user_id_no === undefined || $scope.user_first_name === undefined || $scope.user_username === undefined || $scope.user_id_desc === undefined || $scope.user_mobile === undefined) {
        $scope.edit = true;
      }
    }
    $scope.head = function () {
      alert("called head");
    }
    $scope.checkTicket = function () {
      // alert("inside ticket");
      var checkTicketQuery = new Sources({});
      // alert(user);
      checkTicketQuery.user = Authentication.user._id;
      // checkTicketQuery.index=locTyIndex;
      // checkTicketQuery.id=object[0]._id;
      // source_priority_Update.oldAssetType=object[0].sub_department_id_no[sDeptIndex];
      checkTicketQuery.messageType = "checkUsedTicket";
      // checkTicketQuery.location_type_id=$scope.location_type_id;
      // checkTicketQuery.location_type_id_desc=$scope.location_type_id_desc;
      checkTicketQuery.clientId = Authentication.user.lastName;
      // alert("inside Priority update "+locTyIndex);
      checkTicketQuery.$save(function (response) {
        console.log("inside ticket Check Id \n \n \n");
        ticketObject = response;
        // object=Sources.query();
        // init();
        console.log(ticketObject);
        // console.log(response);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }

    $scope.initDataTable = function () {
      init();
    }

    $scope.initDataTableSA = function () {
      initSA();
    }

    function myFunction() {
      document.getElementById("myDropdown").classList.toggle("show");
    }


    $scope.userRoles;
    // var userscope;
    for (var i = 0; i < 3; i++) {
      if (userScope[i] == 'admin') {
        // alert("yes he is admin");
        $scope.userRoles = true;
        $scope.adminUser = true;
        // alert('hi')
        userscope = true;
        break;
      } else {
        $scope.userRoles = false;
        $scope.adminUser = false;

      }
    }

    //   $('#sourceAdditon').html( '      <table id="example" datatable="ng"  class=" table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%" ></table>' );
    //   if(userscope==true)
    //   {

    //     dt = $('#example').DataTable( {resposive:true,
    //       dom: 'Bfrtip',
    //       buttons: [],
    //       "data": notificationData,                
    //       "columns": [
    //         { "title": "Notification Policy Code" },
    //         { "title": "Notification Policy Name" },
    //         { "title": "Notification Policy Time in minutes" },
    //         { "title": "Notification Policy Reminder in minutes" },

    //         { "title": "Edit" , "width": "15%"
    //       }],
    //       buttons: [

    //               'colvis'
    //           ],
    //           columnDefs: [ {
    //               visible: false
    //           } ],
    //           createdRow: function(row, data, dataIndex) {
    //             $compile(angular.element(row).contents())($scope);
    //           }
    //         });
    //   }
    //   else{

    //   dt = $('#example').DataTable( {resposive:true,
    //     dom: 'Bfrtip',
    //     buttons: [],
    //     "data": notificationData,                
    //     "columns": [
    //       { "title": "Notification Policy Code" },
    //       { "title": "Notification Policy Name" },
    //       { "title": "Notification Policy Time in minutes" },
    //       { "title": "Notification Policy Reminder in minutes" 

    //       // { "title": "Edit" , "width": "15%"
    //     }],
    //     buttons: [

    //             'colvis'
    //         ],
    //         columnDefs: [ {
    //             visible: false
    //         } ],
    //         createdRow: function(row, data, dataIndex) {
    //           $compile(angular.element(row).contents())($scope);
    //         }
    //       });
    //   }

    //       $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
    //       var styles = {
    //         background:"white"
    //        };
    //       $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
    //       $('#example').on( 'length.dt', function ( e, settings, len ) {
    //         console.log( 'New page length: '+len );
    //   }); 
    // }
    /**
     * 
     * Dynamic Table For Notification 
     * 
     */

    // function notificationTable(){
    //   $('#demo').html( '      <table id="example" datatable="ng"  class=" table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%" ></table>' );
    //   if(userscope==true)
    //   {

    //     dt = $('#example').DataTable( {resposive:true,
    //       dom: 'Bfrtip',
    //       buttons: [],
    //       "data": notificationData,                
    //       "columns": [
    //         { "title": "Notification Policy Code" },
    //         { "title": "Notification Policy Name" },
    //         { "title": "Notification Policy Time in minutes" },
    //         { "title": "Notification Policy Reminder in minutes" },
    //         { "title": "Edit" , "width": "15%"},
    //         { "title": "Delete" , "width": "15%"
    //       }],
    //       buttons: [

    //               'colvis'
    //           ],
    //           columnDefs: [ {
    //               visible: false
    //           } ],
    //           createdRow: function(row, data, dataIndex) {
    //             $compile(angular.element(row).contents())($scope);
    //           }
    //         });
    //   }
    //   else{

    //   dt = $('#example').DataTable( {resposive:true,
    //     dom: 'Bfrtip',
    //     buttons: [],
    //     "data": notificationData,                
    //     "columns": [
    //       { "title": "Notification Policy Code" },
    //       { "title": "Notification Policy Name" },
    //       { "title": "Notification Policy Time in minutes" },
    //       { "title": "Notification Policy Reminder in minutes" 

    //       // { "title": "Edit" , "width": "15%"
    //     }],
    //     buttons: [

    //             'colvis'
    //         ],
    //         columnDefs: [ {
    //             visible: false
    //         } ],
    //         createdRow: function(row, data, dataIndex) {
    //           $compile(angular.element(row).contents())($scope);
    //         }
    //       });
    //   }

    //       $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
    //       var styles = {
    //         background:"white"
    //        };
    //       $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
    //       $('#example').on( 'length.dt', function ( e, settings, len ) {
    //         console.log( 'New page length: '+len );
    //   }); 
    // }



    /**
     * 
     * Dynamic Table For Shifts 
     * 
     */

    function shiftsTable() {
      $('#demo').html('      <table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%" ></table>');
      if (userscope == true) {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": shiftData,
          "columns": [{
              "title": "From"
            },
            {
              "title": "To"
            },
            {
              "title": "Shifts"
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            },
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false,
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });
      } else {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": shiftData,
          "columns": [{
              "title": "From"
            },
            {
              "title": "To"
            },
            {
              "title": "Shifts"
              // { "title": "Edit" , "width": "15%"
            }
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });
      }

      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });
    }











    /**
     * 
     * Dynamic Table For Asset Data
     * 
     */

    function assetDataTable() {
      $('#demo').html('      <table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%" ></table>');
      if (userscope == true) {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": AssetData,
          "columns": [{
              "title": "AssetId"
            },
            {
              "title": "Description",
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            },
          ],
          buttons: [
            'colvis'
          ],
          columnDefs: [{
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
            // "width": "4%"
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });
      } else {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": AssetData,
          "columns": [{
              "title": "AssetId"
            },
            {
              "title": "Description"
              // { "title": "Edit" , "width": "15%"
            }
          ],
          buttons: [
            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });
      }




      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });
    }


    /**
     * 
     * Dynamic Table for Manufacture
     * 
     */
    function manufactureTable() {
      $('#demo').html('<table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>');
      if (userscope === true) {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": mfgData,
          "columns": [{
              "title": "Manufacture ID"
            },
            {
              "title": "Description"
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            }

          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });
      } else {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": mfgData,
          "columns": [{
              "title": "Manufacture ID"
            },
            {
              "title": "Description"
              // { "title": "Edit" ,"width": "15%"
            }
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            visible: false
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });

      }


      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });

    }


    /**
     * 
     * Dynamic Table for Escalation
     * 
    //  */
    // function escalationTable(){
    //   $('#demo').html( '<table id="example" datatable="ng"  class=" table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>' );
    //   if(userscope===true){
    //     dt = $('#example').DataTable( {resposive:true,
    //       dom: 'Bfrtip',
    //       buttons: [],
    //       "data": escalationData,
    //       "columns": [
    //         { "title": "Escalation Code " },
    //         { "title": "Escalation Level" },
    //         { "title": "Escalation in Hours" },
    //         { "title": "Edit" ,"width": "15%"
    //       }],
    //       buttons: [
    //               'colvis'
    //           ],
    //           columnDefs: [ {
    //               visible: false
    //           } ],
    //           createdRow: function(row, data, dataIndex) {
    //             $compile(angular.element(row).contents())($scope);
    //           }
    //         });
    //   }
    //   else{
    //     dt = $('#example').DataTable( {resposive:true,
    //       dom: 'Bfrtip',
    //       buttons: [],
    //       "data": escalationData,
    //       "columns": [
    //         { "title": "Escalation Code " },
    //         { "title": "Escalation Level" },
    //         { "title": "Escalation in Hours" 
    //         // { "title": "Edit" ,"width": "15%"
    //       }],
    //       buttons: [
    //               'colvis'
    //           ],
    //           columnDefs: [ {
    //               visible: false
    //           } ],
    //           createdRow: function(row, data, dataIndex) {
    //             $compile(angular.element(row).contents())($scope);
    //           }
    //         });
    //   }



    //       $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
    //       var styles = {
    //         background:"white"
    //        };
    //       $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
    //       $('#example').on( 'length.dt', function ( e, settings, len ) {
    //         console.log( 'New page length: '+len );
    //   }); 

    // }




    /**
     * 
     * Dynamic Table for Model Data
     * 
     */
    function modelTable() {
      $('#demo').html('<table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%" ></table>');
      if (userscope == true) {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": modelData,
          "columns": [{
              "title": "ModelID"
            },
            {
              "title": "Description"
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            }

          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            visible: false
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });
      } else {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": modelData,
          "columns": [{
              "title": "ModelID"
            },
            {
              "title": "Description"
              // { "title": "Edit","width": "15%" }
            }
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });
      }





      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);

      });
    }

    /**
     * 
     * Dynamic Employee Table
     * 
     */

    // function employeeTable(){
    //   $('#demo').html( '<table cellpadding="0" cellspacing="0" border="0" class=" table-striped table-bordered  table" id="example" style="width:100%;max-width:100%"></table>' );
    //  if(userscope==true){

    //   dt = $('#example').DataTable( {resposive:true,
    //     dom: 'Bfrtip',
    //     buttons: [],
    //     "data": employeeData,
    //     "columns": [
    //       // { "title": "Employee ID" },
    //       { "title": "Employee Name" },
    //       { "title": "Description" },
    //       { "title": " Mobile " },
    //       { "title": "Email " } ,
    //       { "title": "Reporting " } ,
    //       { "title": "Edit ","width": "15%" } 
    //     ],
    //     buttons: [
    //             'colvis'
    //         ],
    //         columnDefs: [ {
    //             visible: false
    //         } ],
    //         createdRow: function(row, data, dataIndex) {
    //           $compile(angular.element(row).contents())($scope);
    //         }
    //       });


    //  }
    //  else{
    //   dt = $('#example').DataTable( {resposive:true,
    //     dom: 'Bfrtip',
    //     buttons: [],
    //     "data": employeeData,
    //     "columns": [
    //       // { "title": "Employee ID" },
    //       { "title": "Employee Name" },
    //       { "title": "Description" },
    //       { "title": " Mobile " },
    //       { "title": "Email " } ,
    //       { "title": "Reporting " 

    //       // { "title": "Edit ","width": "15%" } 
    //       }],
    //     buttons: [
    //             'colvis'
    //         ],
    //         columnDefs: [ {
    //             visible: false
    //         } ],
    //         createdRow: function(row, data, dataIndex) {
    //           $compile(angular.element(row).contents())($scope);
    //         }
    //       });
    //     }


    //       $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
    //       var styles = {
    //         background:"white"
    //        };
    //       $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
    //       $('#example').on( 'length.dt', function ( e, settings, len ) {
    //         console.log( 'New page length: '+len );
    //   });
    // }


    /**
     * 
     * Dynamic Department Table
     * 
     */
    function departmentTable() {
      $('#demo').html('<table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>');
      if (userscope == true) {

        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',

          "data": departmentData,
          "columns": [{
              "title": "Department ID"
            },
            {
              "title": "Description"
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            }

          ],
          buttons: [
            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });


      } else {

        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',

          "data": departmentData,
          "columns": [{
              "title": "Department ID"
            },
            {
              "title": "Description"
            }
            // { "title": "Edit","width": "15%" }
          ],
          buttons: [
            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });

      }



      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });
    }


    /**
     * 
     * Dynamic Sub Department Table
     * 
     */
    function subDepartmentTable() {
      $('#demo').html('<table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>');
      if (userscope == true) {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": subDepartmentData,
          "columns": [{
              "title": "Sub Department ID"
            },
            {
              "title": "Description"
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            }

          ],
          buttons: [
            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });
      } else {


        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": subDepartmentData,
          "columns": [{
              "title": "Sub Department ID"
            },
            {
              "title": "Description"
            }
            // { "title": "Edit","width": "15%" }
          ],
          buttons: [
            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });

      }


      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });
    }

    /**
     * 
     * Dynamic Priority table
     * 
     */
    function priorityTable() {
      $('#demo').html('<table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>');
      if (userscope == true) {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": priorityData,
          "columns": [{
              "title": "Priority ID"
            },
            {
              "title": "Description"
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            },

          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });
      } else {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": priorityData,
          "columns": [{
              "title": "Priority ID"
            },
            {
              "title": "Description"
            }
            // { "title": "Edit","width": "15%" }
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });

      }


      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });
    }


    /**
     * 
     * Dynamic AssetMapping table
     * 
     */
    function problemAssetMapping() {
      $('#demo').html('<table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>');
      if (userscope == true) {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": assetMappingData,
          "columns": [{
              "title": "Asset Type ID"
            },
            {
              "title": "Problem"
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            }
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });




      } else {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": assetMappingData,
          "columns": [{
              "title": "Asset Type ID"
            },
            {
              "title": "Problem"
            }
            // { "title": "Edit","width": "15%" }
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });


      }



      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });
    }


    /**
     * 
     * Dynamic Roll table
     * 
     */
    function rollTable() {
      $('#demo').html('<table  id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>');

      if (userscope == true) {

        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          // buttons: [],
          "data": rollData,
          "columns": [{
              "title": "Role ID"
            },
            {
              "title": "Description"
            },
            {
              "title": "Role Time Multiplier"
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            }

          ],
          buttons: [
            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });


      } else {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          // buttons: [],
          "data": rollData,
          "columns": [{
              "title": "Role ID"
            },
            {
              "title": "Description"
            },
            {
              "title": "Role Time Multiplier"
            }
            // { "title": "Edit","width": "15%" }   
          ],
          buttons: [
            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });

      }



      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });
    }

    /**
     * 
     * Dynamic Location Table
     * 
     */
    function locationTable() {
      $('#demo').html('<table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>');
      if (userscope == true) {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          // buttons: [],
          "data": locationTypeData,
          "columns": [{
              "title": "Location Type Id"
            },
            {
              "title": "Description"
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            }

          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });



      } else {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          // buttons: [],
          "data": locationTypeData,
          "columns": [{
              "title": "Location Type Id"
            },
            {
              "title": "Description"
            }
            // { "title": "Edit","width": "15%" }
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });


      }



      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });

    }





    /**
     * 
     * Dynamic Vendor Table
     * 
     */
    function vendorTable() {
      $('#demo').html('<table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>');
      if (userscope == true) {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          // buttons: [],
          "data": vendorData,
          "columns": [{
              "title": "Vendor Company Id"
            },
            {
              "title": "Vendor Name"
            },
            {
              "title": "Vendor Description"
            },
            {
              "title": "Vendor Email"
            },
            {
              "title": "Vendor Phone"
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            }

          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });



      } else {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          // buttons: [],
          "data": vendorData,
          "columns": [{
              "title": "Vendor Company Id"
            },
            {
              "title": "Vendor Name"
            },
            {
              "title": "Vendor Description"
            },
            {
              "title": "Vendor Email"
            },
            {
              "title": "Vendor Phone"
            },
            // { "title": "Edit","width": "15%" }
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });


      }



      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });

    }

    /**
     * 
     * Dynmaic location Table
     * 
     */
    function location2table() {

      $('#demo').html('<table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>');
      if (userscope == true) {

        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "autoWidth": true,
          "data": locData,
          "columns": [{
              "title": "Location ID"
            },
            {
              "title": "Name"
            },
            {
              "title": "Location Type "
            },
            {
              "title": "Longitude  "
            },
            {
              "title": "Latitude  "
            },
            // { "title": "Altitude  " },
            {
              "title": "GMT_Difference  "
            },
            {
              "title": "Under Location  "
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            }

          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });


      } else {

        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "autoWidth": true,
          "data": locData,
          "columns": [{
              "title": "Location ID"
            },
            {
              "title": "Name"
            },
            {
              "title": "Location Type "
            },
            {
              "title": "Longitude  "
            },
            {
              "title": "Latitude  "
            },
            // { "title": "Altitude  " },
            {
              "title": "GMT_Difference  "
            },
            {
              "title": "Under Location  "
            }
            // { "title": "Edit","width": "15%" }                             
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });


      }


      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });
    }

    /**
     * 
     * Dynamic Problem table
     * 
     */
    function problemtable() {

      $('#demo').html('<table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>');
      if (userscope == true) {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": problemData,
          "columns": [{
              "title": "Problem ID"
            },
            {
              "title": "Description"
            },
            {
              "title": "Priority Type "
            },
            {
              "title": "Problem Time in minutes"
            },
            {
              "title": "Status"
            },
            {
              "title": "Notification Remainder in minutes"
            },
            {
              "title": " Escalation Level "
            },
            {
              "title": "Escalation time in minutes"
            },
            {
              "title": "Comment Header"
            },{
              "title": "Comment Suffix"
            },{
              "title": "Comment Prefix"
            },{
              "title": "Comment"
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            }

          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });

      } else {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": problemData,
          "columns": [{
              "title": "Problem ID"
            },
            {
              "title": "Description"
            },
            {
              "title": "Priority Type "
            },
            {
              "title": "Problem Time in minutes"
            },
            {
              "title": "Status"
            },
            {
              "title": "Notification Remainder in minutes"
            },
            {
              "title": " Escalation Level "
            },
            {
              "title": "Escalation time in minutes"
            },
            {
              "title": "Comment Header"
            },{
              "title": "Comment Suffix"
            },{
              "title": "Comment Prefix"
            },{
              "title": "Comment"
            },
            // { "title": "Edit","width": "15%" }                                    
            // { "title": "Edit","width": "15%" }                                    
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });


      }

      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });
    }
    /**
     * 
     * Dynamic user Table
     * 
     */
    function usertable() {
      $('#demo').html('<table id="example" datatable="ng"  class="table table-striped table-bordered" cellspacing="0" style="width:100%;max-width:100%"></table>');
      if (userscope == true) {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "ordering": false,
          "data": userData,
          "columns": [{
              "title": "User ID"
            },
            {
              "title": " Name"
            },
            {
              "title": " Client ID "
            },
            {
              "title": "User Name"
            },
            {
              "title": "Description",
              "width": "20%"
            },
            {
              "title": " Mobile "
            },
            {
              "title": "Email  "
            },
            {
              "title": "Roll  ",
              "width": "20%"
            },
            {
              "title": "Reporting To  ",
              "width": "20%"
            },
            {
              "title": "User Type "
            },
            {
              "title": "Mobile  Privacy  "
            },
            // { "title": "Notify To  " } ,
            {
              "title": "Account Status  "
            },
            {
              "title": "Edit",
              "width": "15%"
            },
            {
              "title": "Delete",
              "width": "15%"
            }

          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });
      } else {
        dt = $('#example').DataTable({
          resposive: true,
          dom: 'Bfrtip',
          buttons: [],
          "data": userData,
          "columns": [{
              "title": "User ID"
            },
            {
              "title": " Name"
            },
            {
              "title": " Client ID "
            },
            {
              "title": "User Name"
            },
            {
              "title": "Description"
            },
            {
              "title": " Mobile "
            },
            {
              "title": "Email  "
            },
            {
              "title": "Roll  "
            },
            {
              "title": "Reporting To  "
            },
            {
              "title": "User Type "
            },
            {
              "title": "Mobile  Privacy  "
            },
            // { "title": "Notify To  " } ,
            {
              "title": "Account Status  "
            },



            // { "title": "Edit","width": "15%" }                               
          ],
          buttons: [

            'colvis'
          ],
          columnDefs: [{
            // visible: false
            visible: true, "targets": 0, // your case first column
            "className": "text-center",
          }],
          createdRow: function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          }
        });


      }

      $("div#example_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
      var styles = {
        background: "white"
      };
      $("div#example_wrapper").find($(".dt-buttons")).find($("a")).css(styles);
      $('#example').on('length.dt', function (e, settings, len) {
        console.log('New page length: ' + len);
      });
    }





    /**
     * 
     *  check the Assetid is present or not
     * 
     */

    $scope.vendorCheck = function () {
      // alert('inside check')
      var assetFlag = 0;
      for (i = 0; i < object[0].vendor_id.length; i++) {
        if (vendorData[i][0] == $scope.vendor_id) {
          $scope.checkPrblm = "Vendor Company Id Already Exist";
          assetFlag = 1;
        }
        if (assetFlag == 1) {
          $scope.checkasset = true;
        } else {
          $scope.checkPrblm = "";
          $scope.checkasset = false;
        }
      }
    }



    $scope.assetCheck = function () {
      // alert('inside asset');
      var assetFlag = 0;
      for (i = 0; i < object[0].asset_type_id_no.length; i++) {
        // alert("inside for loop");
        // alert($scope.asset_type_id_no);
        // alert(AssetData[i][0]);
        if (AssetData[i][0] ==$scope.asset_type_id_no) {
          $scope.assetcheck = "Asset Id Already Exist";
          assetFlag = 1;
        }
        if (assetFlag == 1) {
          $scope.checkasset = true;
        } else {
          $scope.assetcheck = "";
          $scope.checkasset = false;
        }
      }
    }

    /**
     * 
     *  check the Manufactureid is present or not
     * 
     */


    $scope.manufactureCheck = function () {
      var mfgFlag = 0;
      for (i = 0; i < object[0].mfg_id_no.length; i++) {
        if (mfgData[i][0] == $scope.mfg_id_no) {
          $scope.manufacturecheck = "Manufacture Id Already Exist";
          mfgFlag = 1;
        }
        if (mfgFlag == 1) {
          $scope.checkManufacture = true;
          // alert($scope.checkManufacture);
        } else {
          $scope.manufacturecheck = "";
          $scope.checkManufacture = false;
        }
      }
    }


    /**
     * 
     *  check the modelId is present or not
     * 
     */

    $scope.modelCheck = function () {
      var mdlFlag = 0;
      // alert("inside change");
      for (i = 0; i < object[0].model_id_no.length; i++) {
        if (modelData[i][0] == $scope.model_id_no) {
          $scope.checkmodel = "Model Id Already Exist";
          mdlFlag = 1;
        }
        if (mdlFlag == 1) {

          $scope.checkModel = true;
          // alert($scope.checkModel);
        } else {
          $scope.checkmodel = "";
          $scope.checkModel = false;
        }
      }
    }




    /**
     * 
     *  check the EmployeeId is present or not
     * 
     */
    $scope.employeeCheck = function () {
      var emplFlag = 0;
      // alert("inside change");
      for (i = 0; i < object[0].employee_name.length; i++) {
        if (employeeData[i][0] == $scope.employee_name) {
          $scope.checkemployee = "Employee Id Already Exist";
          emplFlag = 1;
        }
        if (emplFlag == 1) {

          $scope.checkEmployee = true;
          // alert($scope.checkModel);
        } else {
          $scope.checkemployee = "";
          $scope.checkEmployee = false;
        }
      }
    }

    /**
     * 
     *  check the DepartmentId is present or not
     * 
     */
    $scope.deptCheck = function () {
      var deptFlag = 0;
      // alert("inside change");
      for (i = 0; i < object[0].department_id_no.length; i++) {
        if (departmentData[i][0] == $scope.department_id_no) {
          $scope.checkDept = "Department Id Already Exist";
          deptFlag = 1;
        }
        if (deptFlag == 1) {

          $scope.checkdept = true;
          // alert($scope.checkdept);
        } else {
          $scope.checkDept = "";
          $scope.checkdept = false;
        }
      }
    }


    /**
     * 
     *  check the SubDepartmentId is present or not
     * 
     */

    $scope.subDeptCheck = function () {
      var subDeptFlag = 0;
      // alert("inside change");
      for (i = 0; i < object[0].sub_department_id_no.length; i++) {
        if (subDepartmentData[i][0] == $scope.sub_department_id_no) {
          $scope.subDeptcheck = "Sub Department Id Already Exist";
          subDeptFlag = 1;
        }
        if (subDeptFlag == 1) {
          $scope.checksubdept = true;
          // alert($scope.checkdept);
        } else {
          $scope.subDeptcheck = "";
          $scope.checksubdept = false;
        }
      }
    }


    /**
     * 
     *  check the PriorityID is present or not
     * 
     */
    $scope.priorityCheck = function () {
      var priorityFlag = 0;
      // alert("inside change");
      for (i = 0; i < object[0].priority_id_no.length; i++) {
        if (priorityData[i][0] == $scope.priority_id_no) {
          $scope.checkPriority = "Priority Id Already Exist";
          priorityFlag = 1;
        }
        if (priorityFlag == 1) {
          $scope.checkpriority = true;
          // alert($scope.checkdept);
        } else {
          $scope.checkPriority = "";
          $scope.checkpriority = false;
        }
      }
    }


    /**
     * 
     *  check the RollID is present or not
     * 
     */
    $scope.rollCheck = function () {
      var rollFlag = 0;
      // alert("inside change");
      for (i = 0; i < object[0].roll_id_no.length; i++) {
        if (rollData[i][0] == $scope.roll_id_no) {
          $scope.checkRoll = "Roll Id Already Exist";
          rollFlag = 1;
        }
        if (rollFlag == 1) {
          $scope.checkroll = true;
          // alert($scope.checkdept);
        } else {
          $scope.checkRoll = "";
          $scope.checkroll = false;
        }
      }
    }



    /**
     * 
     *  check the RollID is present or not
     * 
     */
    $scope.notificatonCheck = function () {
      var rollFlag = 0;
      // alert("inside change");
      for (i = 0; i < object[0].notification_policy_code.length; i++) {
        if (notificationData[i][0] == $scope.notification_policy_code) {
          $scope.checkNotification = "Notification Code Already Exist";
          rollFlag = 1;
        }
        if (rollFlag == 1) {
          $scope.checkNotf = true;
          // alert($scope.checkdept);
        } else {
          $scope.checkNotification = "";
          $scope.checkNotf = false;
        }
      }
    }

    /**
     * 
     *  check the RollID is present or not
     * 
     */
    $scope.escalationCheck = function () {
      var escFlag = 0;
      // alert("inside change");
      for (i = 0; i < object[0].escalation_code.length; i++) {
        if (escalationData[i][0] == $scope.escalation_code) {
          $scope.checkEscalation = "Escalation Code Already Exist";
          escFlag = 1;
        }
        if (escFlag == 1) {
          $scope.checkesc = true;
          // alert($scope.checkdept);
        } else {
          $scope.checkEscalation = "";
          $scope.checkesc = false;
        }
      }
    }

    /**
     * 
     *  check the LocationTypeID is present or not
     * 
     */
    $scope.locTypeId = function () {
      var locTFlag = 0;
      // alert("inside change");
      for (i = 0; i < object[0].location_type_id.length; i++) {
        if (locationTypeData[i][0] == $scope.location_type_id) {
          $scope.checkLocType = "Location Type Id Already Exist";
          locTFlag = 1;
        }
        if (locTFlag == 1) {
          $scope.checkloctype = true;
          // alert($scope.checkdept);
        } else {
          $scope.checkLocType = "";
          $scope.checkloctype = false;
        }
      }
    }


    /**
     * 
     *  check the location ID is present or not
     * 
     */
    $scope.locCheck = function () {
      var locFlag = 0;
      // alert("inside change");
      for (i = 0; i < object[0].location_id.length; i++) {
        if (locData[i][0] == $scope.location_id) {
          $scope.checkLoc = "Location Id Already Exist";
          locFlag = 1;
        }
        if (locFlag == 1) {
          $scope.checkloc = true;
          // alert($scope.checkdept);
        } else {
          $scope.checkLoc = "";
          $scope.checkloc = false;
        }
      }
    }


    /**
     * 
     *  check the ProblemId is present or not
     * 
     */
    $scope.prblmCheck = function () {
      var prblmFlag = 0;
      // alert("inside change");
      for (i = 0; i < object[0].problem_id_no.length; i++) {
        if (problemData[i][0] == $scope.problem_id_no) {
          $scope.checkPrblm = "Problem Id Already Exist";
          prblmFlag = 1;
        }
        if (prblmFlag == 1) {
          $scope.checkprblm = true;
          // alert($scope.checkdept);
        } else {
          $scope.checkPrblm = "";
          $scope.checkprblm = false;
        }
      }
    }


    // $scope.checkSA_Asset_ID=function()
    // {
    //   // alert('inside check');
    //   for(var i=0;i<object4.Data.length;i++){
    //     if(object4.Data[i].source_asset_id_no==$scope.source_asset_id_no)
    //     {
    //       // alert("matched");
    //       $scope.match='Asset Id already exist';
    //       $scope.matchAssetId=true;
    //     }
    //     else{
    //       $scope.match='';
    //       $scope.matchAssetId=false;
    //     }
    //     if(object4.Data[i].source_asset_id_no==$scope.object3.source_asset_id_no)
    //     {
    //       // alert("matched");
    //       $scope.match='Asset Id already exist';
    //       $scope.matchAssetId=true;
    //     }
    //     else{
    //       $scope.match='';
    //       $scope.matchAssetId=false;
    //     }
    //   }
    // }
    $scope.account_disable = function () {
      var disableUser = confirm("Do you want to Disable this account ?");
      if (!disableUser) {
        $scope.user_status = 'Enable';
      }
    }


    $scope.checkSA_Asset_ID = function () {
      var userFlag = 0;
      // alert("inside change username");
      // alert(users2.length);
      for (i = 0; i < object4.Data.length; i++) {
        // alert(users[i].username);
        if (object4.Data[i].source_asset_id_no == $scope.source_asset_id_no) {
          // alert("matched");
          // $scope.usernamepresent="Username Already Exist";
          $scope.match = 'Asset Id already exist';

          // $scope.checkusernamepresent="Username Already Exist";

          userFlag = 1;
          // alert($scope.usernamepresent);

        }

        if (userFlag == 1) {
          $scope.matchAssetId = true;
          // alert($scope.checkdept);
        } else {
          $scope.match = "";
          $scope.matchAssetId = false;
        }
      }
    }







    $scope.checkMail = function () {
      var userFlag = 0;
      // alert("inside mail");
      for (i = 0; i < object[0].user_id_no.length; i++) {
        if (userData[i][6] == $scope.user_email) {
          $scope.checkUserEmail = "Email id Already Exist";
          userFlag = 1;
        } else {
          $scope.checkUserEmail = "";
        }
        if (userFlag == 1) {
          $scope.checkuser = true;
          // alert($scope.checkdept);
        } else {
          $scope.checkUser = "";
          $scope.checkuser = false;
        }
      }

    }

    $scope.checkMobile = function () {
      var userFlag = 0;
      // alert("inside mobile")
      for (i = 0; i < object[0].user_id_no.length; i++) {

        if (userData[i][5] == $scope.user_mobile) {
          $scope.checkUserMobile = "Mobile Number Already Exist";
          userFlag = 1;
        } else {
          $scope.checkUserMobile = "";
        }
        if (userFlag == 1) {
          $scope.checkuser = true;
          // alert($scope.checkdept);
        } else {
          $scope.checkUser = "";
          $scope.checkuser = false;
        }
      }
    }






    /**
     * 
     *  check the UserID is present or not
     * 
     */
    $scope.userCheck = function () {
      var userFlag = 0;
      // alert("inside change");
      // alert($scope.user_id_no);

      for (i = 0; i < object[0].user_id_no.length; i++) {
        // alert(userData[i][0]);
        if (userData[i][0] == $scope.user_id_no) {
          // alert("matche");
          $scope.checkUser = "User Id Already Exist";
          userFlag = 1;
          break;
        } else {
          $scope.checkUser = "";
        }

      }
      if (userFlag == 1) {
        $scope.checkuser = true;
        // alert($scope.checkdept);
      } else {
        $scope.checkUser = "";
        $scope.checkuser = false;
      }
    }


    /**
     * 
     *  check the UserID is present or not
     * 
     */
    $scope.checkprblmAsset = function () {
      var prblmFlag = 0;
      // alert("inside change");
      // for(i=0;i<object[0].problem_asset_mapping_asset_type_id.length;i++){
      //   if(assetMappingData[i][0]==$scope.problem_asset_mapping_asset_type_id&&assetMappingData[i][1]==$scope.problem_asset_mapping_problem){
      //     $scope.checkPrblmAssetMap="Asset And Problem Already Exist";
      //     prblmFlag=1;
      //   }
      //   if(prblmFlag==1){
      //     $scope.checkprblmAst = true;
      //     // alert($scope.checkdept);
      //   }
      //   else{
      //     $scope.checkPrblmAssetMap="";
      //     $scope.checkprblmAst = false;
      //   }

      //   if($scope.problem_asset_mapping_asset_type_id==""||$scope.problem_asset_mapping_asset_type_id==null||$scope.problem_asset_mapping_asset_type_id==undefined&&$scope.problem_asset_mapping_asset_type_id==""||$scope.problem_asset_mapping_asset_type_id==null||$scope.problem_asset_mapping_asset_type_id==undefined){
      //     $scope.checkprblmAst=true;
      //   }

      // }
    }






    /**
     * 
     *  check the UserID is present or not
     * 
     */
    $scope.checkShift = function () {
      var shiftFlag = 0;
      var fromhr, tohr;
      fromhr = $scope.from.split(":");
      if ($scope.to != undefined || $scope.to != "" || $scope.to != null) {
        tohr = $scope.to.split(":");
      }
      // alert(fromhr);
      // alert(tohr);

      var hr = Number(fromhr[0]);
      var tohr2 = Number(tohr[0]);
      var frmin = Number(fromhr[1]);
      var tomin = Number(tohr[1]);

      // alert(hr);
      if (hr > tohr2 || (hr == tohr2 && frmin > tomin)) {
        $scope.checkShifttxt = "From time should be less than To time";
        $scope.checkshift = true;
      } else {
        $scope.checkShifttxt = "";
        $scope.checkshift = false;
      }
      // alert("inside change");
      for (i = 0; i < object[0].from.length; i++) {
        if (shiftData[i][0] == $scope.from && shiftData[i][1] == $scope.to && shiftData[i][2] == $scope.shifts) {
          // alert(" change");
          shiftFlag = 1;
        }

        if (shiftFlag == 1) {
          $scope.checkshift = true;
          $scope.checkShifttxt = "Shift Already Exist";

          // alert($scope.checkdept);
        } else {
          $scope.checkShifttxt = "";
          $scope.checkshift = false;
        }
      }
    }


    /**
     * 
     * Update Asset Function
     * 
     */
    $scope.assetUpdate = function (index) {
      $scope.asset_type_id_no = object[0].asset_type_id_no[index];
      $scope.asset_type_id_des = object[0].asset_type_id_des[index];
      assetIndex = index;
    }


    /**
     * 
     * Update Manufacture Function
     * 
     */
    $scope.manufactureUpdate = function (index) {
      $scope.mfg_id_no = object[0].mfg_id_no[index];
      $scope.mfg_id_des = object[0].mfg_id_des[index];
      manufactureIndex = index;
    }


    /**
     * 
     * Update Problem Asset Mapping Function
     * 
     */
    $scope.assetMappingUpdate = function (index) {
      $(".prblmAssetId").val(object[0].problem_asset_mapping_asset_type_id[index]).trigger("chosen:updated");
      $(".prblmNo").val(object[0].problem_asset_mapping_problem[index]).trigger("chosen:updated");

      prblmAstID = object[0].problem_asset_mapping_asset_type_id[index];
      astMpngPrblmId = object[0].problem_asset_mapping_problem[index];
      // $scope.mfg_id_no=object[0].mfg_id_no[index];
      // $scope.mfg_id_des=object[0].mfg_id_des[index];
      assetMappingIndex = index;
    }



    // updateAssetMapping
    /**
     * 
     * Update Department Function
     * 
     */
    $scope.departmentUpdate = function (index) {
      $scope.department_id_no = object[0].department_id_no[index];
      $scope.department_id_dec = object[0].department_id_dec[index];
      // alert(index);
      manufactureIndex = index;
    }

    /**
     * 
     * Update Model Function
     * 
     */

    $scope.modelUpdate = function (index) {
      $scope.model_id_no = object[0].model_id_no[index];
      $scope.model_id_des = object[0].model_id_des[index];
      // alert(index);
      modelIndex = index;
    }

    /**
     * 
     * Update Model Function
     * 
     */

    // $scope.escalationUpdate=function(index){
    //   $scope.escalation_code=object[0].escalation_code[index];
    //   $scope.escalation_level=object[0].escalation_level[index];
    //   $scope.escalation_reassignment=object[0].escalation_reassignment[index];

    //   // alert(index);
    //   escalationIndex=index;
    // }




    /**
     * 
     * Update Employee Function
     * 
     */
    // $scope.employeeUpdate=function(index){
    //   // $scope.employee_id_no=object[0].employee_id_no[index];
    //   $scope.employee_name=object[0].employee_name[index];
    //   $scope.employee_id_dec=object[0].employee_id_dec[index];
    //   $scope.employee_mobile=object[0].employee_mobile[index];
    //   $scope.employee_email=object[0].employee_email[index];
    //   $(".reportingTo").val(object[0].employee_reporting[index]).trigger("chosen:updated");
    //   // alert(index);
    //   emprpt=object[0].employee_reporting[index];
    //   employeeIndex=index;
    // }

    /**
     * 
     * Update Department Function
     * 
     */
    $scope.departmentUpdate = function (index) {
      $scope.department_id_no = object[0].department_id_no[index];
      $scope.department_id_dec = object[0].department_id_dec[index];
      // alert(index);
      deptIndex = index;
    }

    $scope.vendorUpdate = function (index) {
      $scope.vendor_id = object[0].vendor_id[index];
      alert(object[0].vendor_id[index]);
      $scope.vendor_name = object[0].vendor_name[index];
      $scope.vendor_phone = object[0].vendor_phone[index];
      $scope.vendor_description = object[0].vendor_description[index];
      $scope.vendor_email = object[0].vendor_email[index];
      // alert(index);
      vendorIndex = index;
    }


    /**
     * 
     * Update SubDepartment Function
     * 
     */
    $scope.subDepartmentUpdate = function (index) {
      $scope.sub_department_id_no = object[0].sub_department_id_no[index];
      $scope.sub_department_id_dec = object[0].sub_department_id_dec[index];
      // alert(index);
      sDeptIndex = index;
    }

    /**
     * 
     * Update Shift Function
     * 
     */
    $scope.shiftUpdate = function (index) {
      $scope.from = object[0].from[index];
      $scope.to = object[0].to[index];
      $scope.shifts = object[0].shifts[index];

      // alert(index);
      shiftIndex = index;
    }


    /**
     * 
     * Update Priority Function
     * 
     */

    $scope.priorityUpdate = function (index) {
      $scope.priority_id_no = object[0].priority_id_no[index];
      $scope.priority_id_dec = object[0].priority_id_dec[index];
      // alert(index);
      priorityIndex = index;
    }

    /**
     * 
     * Update Roll Function
     * 
     */
    $scope.rollUpdate = function (index) {
      $scope.roll_id_no = object[0].roll_id_no[index];
      $scope.roll_id_desc = object[0].roll_id_desc[index];
      $scope.roll_time_multiplier = object[0].roll_time_multiplier[index];
      // alert(index);
      rollIndex = index;
    }

    /**
     * 
     * Update LocationType Function
     * 
     */
    $scope.locationUpdate = function (index) {
      $scope.location_type_id = object[0].location_type_id[index];
      $scope.location_type_id_desc = object[0].location_type_id_desc[index];
      // alert(index);
      locTyIndex = index;
    }


    /**
     * 
     * Update location Function
     * 
     */
    $scope.locationDUpdate = function (index) {
      $scope.location_id = object[0].location_id[index];
      $scope.name_of_the_location = object[0].name_of_the_location[index];
      $scope.location_type_id2 = object[0].location_type_id2[index];
      $scope.longitude = object[0].longitude[index];
      $scope.latitude = object[0].latitude[index];
      // $scope.altitude=object[0].altitude[index];
      $scope.gmt_different = object[0].gmt_different[index];
      loctype = object[0].location_type_id2[index];
      undrloc = object[0].under_location[index];
      $scope.under_location = object[0].under_location[index];
      $(".locType").val(object[0].location_type_id2[index]).trigger("chosen:updated");
      $(".underLoc").val(object[0].under_location[index]).trigger("chosen:updated");
      // alert(index);
      locIndex = index;


      var markers = [
        // {
        //     "title": 'Alibaug',
        //     "lat": '18.641400',
        //     "lng": '72.872200',
        //     "description": 'Alibaug is a coastal town and a municipal council in Raigad District in the Konkan region of Maharashtra, India.'
        // },
        // {
        //     "title": 'Lonavla',
        //     "lat": '18.750000',
        //     "lng": '73.416700',
        //     "description": 'Lonavla'
        // },
        // {
        //     "title": 'Mumbai',
        //     "lat": '18.964700',
        //     "lng": '72.825800',
        //     "description": 'Mumbai formerly Bombay, is the capital city of the Indian state of Maharashtra.'
        // },
        // {
        //     "title": 'Pune',
        //     "lat": '18.523600',
        //     "lng": '73.847800',
        //     "description": 'Pune is the seventh largest metropolis in India, the second largest in the state of Maharashtra after Mumbai.'
        // },
        // {
        //     "title": 'Thane',
        //     "lat": '19.182800',
        //     "lng": '72.961200',
        //     "description": 'Thane'
        // },
        {
          "title": 'Vashi',
          "lat": object[0].latitude[index],
          "lng": object[0].longitude[index],
          "description": 'Vashi'
        }
      ];
      /* window.onload = */
      $scope.map2 = function () {
        alert("loading map...2");
        var scope = angular.element($("#outer")).scope();
        //   scope.$apply(function(){
        //     scope.longitude = 'Superhero';
        // })
        var mapOptions = {
          center: new google.maps.LatLng(markers[0].lat, markers[0].lng),
          // zoom: 8,
          zoom: 0,
          fullscreenControl: false,
          // center: {lat: -33, lng: 151},
          // zoomControl: false,
          // scaleControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var infoWindow = new google.maps.InfoWindow();
        var latlngbounds = new google.maps.LatLngBounds();
        var geocoder = geocoder = new google.maps.Geocoder();
        var map = new google.maps.Map(document.getElementById("dvMap"), mapOptions);
        // scaleControl: false;
        // };

        for (var i = 0; i < markers.length; i++) {
          var data = markers[i]
          var myLatlng = new google.maps.LatLng(data.lat, data.lng);
          var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: data.title,
            draggable: true,
            animation: google.maps.Animation.DROP
          });

          (function (marker, data) {
            google.maps.event.addListener(marker, "click", function (e) {
              infoWindow.setContent(data.description);
              infoWindow.open(map, marker);
            });
            google.maps.event.addListener(marker, "dragend", function (e) {
              var lat, lng, address;
              geocoder.geocode({
                'latLng': marker.getPosition()
              }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  lat = marker.getPosition().lat();
                  lng = marker.getPosition().lng();
                  address = results[0].formatted_address;
                  // alert("Latitude: " + lat + "\nLongitude: " + lng + "\nAddress: " + address);
                  $scope.longitude = lng;
                  $scope.latitude = lat;
                  $scope.makeSubmitbuttonTrue=false;
                  // alert($scope.makeSubmitbuttonTrue);
                  $scope.UpdateLocationForm.$pristine = false;
                  long = lng;
                  lati = lat;
                  $scope.changemap = false;
                  alert("inside location change");
                  alert($scope.longitude);
                  document.getElementById('longitude2').value = long;
                  // alert("latitude "+lati);
                  document.getElementById('latitude2').value = lati;

                }
              });

            });
          })(marker, data);
          latlngbounds.extend(marker.position);
        }
        var bounds = new google.maps.LatLngBounds();
        map.setCenter(latlngbounds.getCenter());
        map.fitBounds(latlngbounds);
      }
    }

    /**
     * 
     * Update Problem Function
     * 
     */
    $scope.problemUpdate = function (index) {
      $scope.problem_id_no = object[0].problem_id_no[index];
      $scope.problem_id_desc = object[0].problem_id_desc[index];
      $scope.escalation_hrs = object[0].escalation_hrs[index];
      $scope.notification_policy_reminder = object[0].notification_policy_reminder[index];
      $scope.escalation_hrs = object[0].escalation_hrs[index];
      $scope.escalation_level = object[0].escalation_level[index];
      $scope.problem_time = object[0].problem_time[index];
      $scope.comment_Header = object[0].comment_Header[index];
      $scope.comment_Suffix = object[0].comment_Suffix[index];
      $scope.comment_Prefix = object[0].comment_Prefix[index];
      // $scope.comment = object[0].comment[index];

      // $scope.priority_id_no2=object[0].priority_id_no2[index];
      $(".prtTypet").val(object[0].priority_id_no2[index]).trigger("chosen:updated");
      $(".ecllvl").val(object[0].escalation_level[index]).trigger("chosen:updated");
      $(".prtType").val(object[0].problem_status[index]).trigger("chosen:updated");
      if (object[0].comment[index] === true) {
        $(".comment").val('true').trigger("chosen:updated");
      } else {
        $(".comment").val('false').trigger("chosen:updated");
      }
      // alert(object[0].notification_policy_code2[index]);
      // $(".notifctnCode").val(object[0].notification_policy_code[index]).trigger("chosen:updated");
      // $(".escltnCode").val(object[0].escalation_code[index]).trigger("chosen:updated");
      prioritytype = object[0].priority_id_no2[index];
      ntfcode = object[0].escalation_level[index];
      esclcode = object[0].escalation_level[index];
      prblmstatus = object[0].problem_status[index];
      problemIndex = index;
    }

    $scope.vendorCopy = function () {
      $scope.vendor_id = '';
    }

    // $('.latitude2').on("change", function () {
    //   alert("hi")
    // })
    /**
     * 
     * Update notification Function
     * 
     */
    $scope.notificationUpdate = function (index) {
      $scope.notification_policy_code = object[0].notification_policy_code[index];
      $scope.notification_policy_name = object[0].notification_policy_name[index];
      $scope.notification_policy_reminder = object[0].notification_policy_reminder[index];
      // $scope.priority_id_no2=object[0].priority_id_no2[index];
      // $(".prtTypet").val(object[0].priority_id_no2[index]).trigger("chosen:updated");
      $scope.notification_policy_time1 = object[0].notification_policy_time1[index];
      notificationIndex = index;
    }





    /**
     * 
     * Update User Function
     * 
     */
    $scope.userUpdate = function (index) {
      $scope.user_id_no = object[0].user_id_no[index];
      $scope.user_first_name = object[0].user_first_name[index];
      $scope.user_last_name = object[0].user_last_name[index];
      $scope.user_username = object[0].user_username[index];
      findUser = object[0].user_username[index];
      $scope.user_id_desc = object[0].user_id_desc[index];
      $scope.user_mobile = object[0].user_mobile[index];
      $scope.user_email = object[0].user_email[index];
      $scope.user_status = object[0].user_status[index];
      // $scope.roll_id_no2=object[0].roll_id_no2[index];
      $(".rollId").val(object[0].roll_id_no2[index]).trigger("chosen:updated");
      // $(".prtTypet").val(object[0].priority_id_no2[index]).trigger("chosen:updated");
      rollid = object[0].roll_id_no2[index];
      var i = index;
      alert(object[0].user_mobile_privacy[index]);
      if (object[0].user_mobile_privacy[index] == true) {
        $(".mobileprivacy").val("true").trigger("chosen:updated");
      } else {
        $(".mobileprivacy").val("false").trigger("chosen:updated");
      }

      $(".reportingToUpd").val(object[0].user_reporting[index]).trigger("chosen:updated");
      userReprt = object[0].user_reporting[index];
      if (object[0].user_roll_admin[index] == true && object[0].user_roll_technician[index] == true && object[0].user_roll_user[index] == true) {
        // userData[i].push("Admin,User,Technician");
        $scope.user_roll_admin = true;
        $scope.user_roll_user = true;
        $scope.user_roll_technician = true;


      } else if (object[0].user_roll_admin[index] == true && object[0].user_roll_technician[index] == true && object[0].user_roll_user[index] == false) {
        // userData[i].push("Admin,Technician");
        $scope.user_roll_admin = true;
        $scope.user_roll_user = false;
        $scope.user_roll_technician = true;
      } else if (object[0].user_roll_admin[i] == true && object[0].user_roll_user[i] == true && object[0].user_roll_technician[i] == false) {
        // userData[i].push("Admin,User");
        $scope.user_roll_admin = true;
        $scope.user_roll_user = true;
        $scope.user_roll_technician = false;
      } else if (object[0].user_roll_admin[i] == true && object[0].user_roll_technician[i] == false && object[0].user_roll_user[i] == false) {
        alert('admin')
        // userData[i].push("Admin");
        $scope.user_roll_admin = true;
        $scope.user_roll_user = false;
        $scope.user_roll_technician = false;
      } else if (object[0].user_roll_technician[i] == true && object[0].user_roll_user[i] == true && object[0].user_roll_admin[i] == false) {
        // userData[i].push("User,Technician");
        $scope.user_roll_admin = false;
        $scope.user_roll_user = true;
        $scope.user_roll_technician = true;
      } else if (object[0].user_roll_technician[i] == true && object[0].user_roll_admin[i] == false && object[0].user_roll_user[i] == false) {
        // userData[i].push("Technician");
        $scope.user_roll_admin = false;
        $scope.user_roll_user = false;
        $scope.user_roll_technician = true;
      } else if (object[0].user_roll_admin[i] == false && object[0].user_roll_technician[i] == false && object[0].user_roll_user[i] == true) {
        // userData[i].push("user");
        $scope.user_roll_admin = false;
        $scope.user_roll_user = true;
        $scope.user_roll_technician = false;
      }

      // alert(index);
      userIndex = index;
    }

    /**
     * 
     * Function for intialize Source Addition Table
     * 
     */
    function initSA() {
      // alert("Called initdatatable for SA");
      console.log("in initDataTables");
      console.log("this is object 2");
      console.log(object2);
      $(document).ready(function () {
        var date_input = $('input[name="date1"]');
        var date_input2 = $('input[name="date2"]'); //our date input has the name "date"

        var date_input3 = $('input[name="date3"]');
        var date_input4 = $('input[name="date4"]'); //our date input has the name "date"
        //our date input has the name "date"
        //our date input has the name "date"
        var container = $('.bootstrap-iso form').length > 0 ? $('.bootstrap-iso form').parent() : "body";
        var options = {
          format: 'mm/dd/yyyy',
          container: container,
          todayHighlight: true,
          autoclose: true,
        };
        date_input.datepicker(options);
        date_input2.datepicker(options);
        date_input3.datepicker(options);
        date_input4.datepicker(options);
      })

      $scope.generate2 = function () {

                  
        var columns = [                {
            title: "Asset id",
            dataKey: "AssetId"
          },                  {
            title: "Tag id",
            dataKey: "TagId"
          },                    {
            title: "Asset type id",
            dataKey: "AssetTypeID"
          },                    {
            title: "Manufacture Id",
            dataKey: "MfgID"
          },                    {
            title: "Model ID",
            dataKey: "ModelId"
          },                    {
            title: "User ID",
            dataKey: "UserID"
          },                    {
            title: "Sub Department ID",
            dataKey: "SubDepartmentID"
          },                    {
            title: "Department ID",
            dataKey: "DepartmentID"
          },                    {
            title: "Location Type ID",
            dataKey: "LocationTypeID"
          },                  {
            title: "Location ID	",
            dataKey: "LocationID"
          },                  {
            title: "Notify To",
            dataKey: "notify"
          },                  {
            title: "Asset Type",
            dataKey: "asttype"
          },                  {
            title: "Installation date",
            dataKey: "Installationdate"
          },                  {
            title: "Last service",
            dataKey: "Lastservice"
          },                  {
            title: "Next service",
            dataKey: "Nextservice"
          },                  {
            title: "AMC expiry Date",
            dataKey: "AMCexpiry"
          }


                      
        ];







                  
        var rows = [];          
        var tbldata = $scope.object2.Data;
        var pdfsize = 'a0';        
        var doc = new jsPDF('l', 'pt', pdfsize);       
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        if (dd < 10) {
          dd = '0' + dd;
        }
        if (mm < 10) {
          mm = '0' + mm;
        }
        var today = dd + '/' + mm + '/' + yyyy;
        var installDate, installDate2, lastServ, lastServ2, nextServ, nextServ2, amcExpiry, amcExpiry2;

                  
        console.log(Object.keys(tbldata).length);          
        for (var x = 0; x < Object.keys(tbldata).length; x++) {              
          installDate = new Date($filter('date')($scope.object2.Data[x].source_installation_date, 'MM-dd-yyyy'));
          installDate2 = $filter('date')(installDate, 'dd-MM-yyyy');
          lastServ = new Date($filter('date')($scope.object2.Data[x].source_last_service, 'MM-dd-yyyy'));
          lastServ2 = $filter('date')(lastServ, 'dd-MM-yyyy');
          nextServ = new Date($filter('date')($scope.object2.Data[x].source_next_service, 'MM-dd-yyyy'));
          nextServ2 = $filter('date')(nextServ, 'dd-MM-yyyy');
          amcExpiry = new Date($filter('date')($scope.object2.Data[x].source_amc_expr, 'MM-dd-yyyy'));
          amcExpiry2 = $filter('date')(amcExpiry, 'dd-MM-yyyy');              
          rows[x] = {
            'AssetId': $scope.object2.Data[x].source_asset_id_no,
            'TagId': $scope.object2.Data[x].tag_id,
            'AssetTypeID': $scope.object2.Data[x].source_asset_type_id_no,
            'MfgID': $scope.object2.Data[x].source_mfg_id_no,
            'ModelId': $scope.object2.Data[x].source_model_id_no,
            'UserID': $scope.object2.Data[x].source_user_id_no,
            'SubDepartmentID': $scope.object2.Data[x].source_sub_department_id_no,
            'DepartmentID': $scope.object2.Data[x].source_department_id_no,
            'LocationTypeID': $scope.object2.Data[x].source_location_type_id,
            'LocationID': $scope.object2.Data[x].source_location_id,
            'Installationdate': installDate2,
            'Lastservice': lastServ2,
            'Nextservice': nextServ2,
            'AMCexpiry': amcExpiry2,
            'notify': $scope.object2.Data[x].user_notify_to,
            'asttype': $scope.object2.Data[x].source_asset_type
          }          
        }          
        console.log(rows);          
        var pdfsize = 'a0';          
        var doc = new jsPDF('l', 'pt', pdfsize);          

                  
        var res = doc.autoTableHtmlToJson(document.getElementById("example2"), false);          
        doc.setFontSize(50);          
        doc.autoTable(columns, rows, {             //startY: 60,
                      
          theme: 'grid',
                      styles: {              
            overflow: 'linebreak',
                          fontSize: 30,
                          // rowHeight: 60,
                           //cellPadding:20,    
                          // columnWidth: 'wrap'
                        
          },
                      margin: {
            top: 160
          },
                        columnStyles: {               //1: {columnWidth: 'auto'}
                          
            columnWidth: 100                
          },
                      addPageContent: function (data) {                    
            doc.text("Addition Table", 30, 80);              
            doc.text("Date :" + today, 2900, 80);

                            
          }            
        });          
        //           var canvas = document.querySelector('#pieChart');
        //             //creates image
        //             var canvasImg = canvas.toDataURL("image/jpeg");

        //             //creates PDF from img
        //             //var doc = new jsPDF('landscape');
        //             doc.setFontSize(50);
        //             doc.setFillColor(0,0,0,0);
        //             doc.rect(10, 10, 150, 160, "F");
        //             doc.text(30, 60, "Chart");
        //             doc.addImage(canvasImg, 'JPEG',30,70,800, 450 );// wxh

                  
        doc.save("table.pdf");        
      }




      $timeout(function () {
        var rowCount = $(".example tr").length;
        // console.log("Row count value is"+rowCount);
        if (rowCount >= 0) {
          //console.log("Entered into Sorting");
          $('#example2').dataTable().fnDestroy()
          $('#example2').dataTable({
            resposive: true,
            autoWidth: false,

            dom: 'Bfrtip',
            buttons: [
              //'copy', 'csv', 'excel', 'pdf',
              // {
              //     extend: 'print',
              //     exportOptions: {
              //         columns: ':visible'
              //     },
              // },
              // {
              //     extend: 'copy',
              //     exportOptions: {
              //         columns: ':visible'
              //     },
              // },
              // {
              //     extend: 'csv',
              //     exportOptions: {
              //         columns: ':visible'
              //     },
              // },
              // {
              //     extend: 'excel',
              //     exportOptions: {
              //         columns: ':visible'
              //     },
              // },
              // {
              //     extend: 'pdf',
              //     orientation: 'landscape',
              //     pageSize: 'LEGAL',
              //     exportOptions: {
              //         columns: ':visible'
              //     },
              // },
              'colvis'
            ],
            columnDefs: [{
                targets: [-5, -6, -7, -8], // -2 is reassign, -3 is notification
                visible: false
              },
              {
                width: "10%",
                targets: [14]

              }
            ]
          });
          $("div#example2_wrapper").find($(".dt-buttons")).css("margin-bottom", "30px");
          var styles = {

            background: "white"
          };
          $("div#example2_wrapper").find($(".dt-buttons")).find($("a")).css(styles);


          $('#example2').on('length.dt', function (e, settings, len) {
            console.log('New page length: ' + len);
          });
        }
      }, 1000);
    }
    // $interval($scope.alertfunction, 200);
    // $scope.alertfunction=function() {
    //   // $timeout(function() {
    //   //   alert("asd");
    //   // }, 900)
    //   alert("dawdwa");
    // }
    function init() {
      // alert(userScope);

      // alert($scope.userRoles);
      // alert("Client id is "+UclientId);
      $timeout(function () {



        var rowCount = $(".example tr").length;
        // console.log("Row count value is"+rowCount);
        if (rowCount >= 0) {



          /**
           * 
           *Initializing the Default Asset Data Table
           * 
           */

          $('#example').dataTable().fnDestroy()
          $('#example').dataTable({
            resposive: true,
            dom: 'Bfrtip',
            buttons: []
          });
          long = $scope.longitude;
          lati = $scope.latitude;
          /**
           * 
           * Pushing Data into modelData Variable
           * for Showing data in to Dyanmic 
           * Model table
           * 
           */


          $scope.userRoles;
          // var userscope;
          for (var i = 0; i < 3; i++) {
            if (userScope[i] == 'admin') {
              // alert("yes he is admin");
              $scope.userRoles = true;
              $scope.adminUser = true;
              // alert('hi')
              userscope = true;
              break;
            } else {
              $scope.userRoles = false;
              $scope.adminUser = false;

            }
          }





          var markers = [
            // {
            //     "title": 'Alibaug',
            //     "lat": '18.641400',
            //     "lng": '72.872200',
            //     "description": 'Alibaug is a coastal town and a municipal council in Raigad District in the Konkan region of Maharashtra, India.'
            // },
            // {
            //     "title": 'Lonavla',
            //     "lat": '18.750000',
            //     "lng": '73.416700',
            //     "description": 'Lonavla'
            // },
            // {
            //     "title": 'Mumbai',
            //     "lat": '18.964700',
            //     "lng": '72.825800',
            //     "description": 'Mumbai formerly Bombay, is the capital city of the Indian state of Maharashtra.'
            // },
            // {
            //     "title": 'Pune',
            //     "lat": '18.523600',
            //     "lng": '73.847800',
            //     "description": 'Pune is the seventh largest metropolis in India, the second largest in the state of Maharashtra after Mumbai.'
            // },
            // {
            //     "title": 'Thane',
            //     "lat": '19.182800',
            //     "lng": '72.961200',
            //     "description": 'Thane'
            // },
            {
              "title": 'Jayanaggar',
              "lat": '12.925478928445798',
              "lng": '77.5946163709641',
              "description": 'Jayanagar'
            }
          ];
          /* window.onload = */
          $scope.map = function () {
            document.getElementById("closemap3").disabled = true;
            document.getElementById("updateButton").disabled = true;
            
            alert("loading map...");
            var mapOptions = {
              center: new google.maps.LatLng(markers[0].lat, markers[0].lng),
              // zoom: 8,
              zoom: 5,
              fullscreenControl: false,
              // center: {lat: -33, lng: 151},
              // zoomControl: false,
              // scaleControl: false,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var infoWindow = new google.maps.InfoWindow();
            var latlngbounds = new google.maps.LatLngBounds();
            var geocoder = geocoder = new google.maps.Geocoder();
            var map = new google.maps.Map(document.getElementById("dvMap"), mapOptions);
            // scaleControl: false;
            // };

            for (var i = 0; i < markers.length; i++) {
              var data = markers[i]
              var myLatlng = new google.maps.LatLng(data.lat, data.lng);
              var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: data.title,
                draggable: true,
                animation: google.maps.Animation.DROP
              });

              (function (marker, data) {
                google.maps.event.addListener(marker, "click", function (e) {
                  infoWindow.setContent(data.description);
                  infoWindow.open(map, marker);
                });
                google.maps.event.addListener(marker, "dragend", function (e) {
                  var lat, lng, address;
                  geocoder.geocode({
                    'latLng': marker.getPosition()
                  }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                      lat = marker.getPosition().lat();
                      lng = marker.getPosition().lng();
                      address = results[0].formatted_address;
                      // alert("Latitude: " + lat + "\nLongitude: " + lng + "\nAddress: " + address);
                      $scope.longitude = lng;
                      $scope.latitude = lat;
                      $scope.update=false;
                      long = lng;
                      lati = lat;
                      alert("inside change map");
                      // alert($scope.makeSubmitbuttonTrue);
                      // // checkloc||addLocationForm.$invalid
                      // alert($scope.checkloc);
                      // alert($scope.addLocationForm.$invalid);
                      // alert($scope.longitude);
                      document.getElementById('longitude').value = long;
                      // alert("latitude "+lati);
                      
                      document.getElementById('latitude').value = lati;
                      document.getElementById("closemap3").disabled = false;
                      document.getElementById("updateButton").disabled = false;
                    }
                  });

                });
              })(marker, data);
              latlngbounds.extend(marker.position);
            }
            var bounds = new google.maps.LatLngBounds();
            map.setCenter(latlngbounds.getCenter());
            map.fitBounds(latlngbounds);
          }

          if (checkUser == "present") {




            var objectTry;


            var dt;
            var len = object[0].model_id_no.length;
            //   if(object[0].model_id_no[0][1]==""){
            //      len=object[0].model_id_no.length-1;
            //  }
            //  else
            //  {

            //  }//data from db

            modelData = new Array(len);
            for (var i = 0; i < len; i++) {
              modelData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].model_id_no.length; i++) { //Columns
              for (var j = 0; j < 4; j++) { //Rows
                if (j == 0) {
                  modelData[i].push( object[0].model_id_no[i]);
                } else if (j == 1) {
                  modelData[i].push('<center>' + object[0].model_id_des[i] + '</center>');
                } else if (j == 2) {
                  modelData[i].push('<center><a href="#"  onclick="openPopup3()" ><button class = "btn-success dim btn btn-sm btn-success abc myBtn edit" ng-disabled="!userRoles" ng-click="modelUpdate(' + i + ')"><i class="fa fa-pencil"></i>Edit</button></a>');
                } else {
                  modelData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"   ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="modelDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }



            var Vlen = object[0].vendor_id.length;
            vendorData = new Array(Vlen);
            for (var i = 0; i < Vlen; i++) {
              vendorData[i] = new Array(0);
            }
            // alert(object[0].vendor_id.length);
            for (var i = 0; i < object[0].vendor_id.length; i++) { //Columns
              for (var j = 0; j < 7; j++) { //Rows
                if (j == 0) {
                  vendorData[i].push(object[0].vendor_id[i] );
                } else if (j == 1) {
                  vendorData[i].push('<center>' + object[0].vendor_name[i] + '</center>');
                } else if (j == 2) {
                  vendorData[i].push('<center>' + object[0].vendor_description[i] + '</center>');
                } else if (j == 3) {
                  vendorData[i].push('<center>' + object[0].vendor_email[i] + '</center>');
                } else if (j == 4) {
                  vendorData[i].push('<center>' + object[0].vendor_phone[i] + '</center>');
                } else if (j == 5) {
                  vendorData[i].push('<center><a href="#"  onclick="openPopup15()" ><button class = "btn-success dim btn btn-sm btn-success abc myBtn edit" ng-disabled="!userRoles" ng-click="vendorUpdate(' + i + ')"><i class="fa fa-pencil"></i>Edit</button></a>');
                } else {
                  vendorData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"  class="" ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="vendorDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }

            // if(modelData[0][1]==""){
            //   alert("inside slice if condition");
            //   modelData[0].splice(0);

            //   // delete modelData[0];

            //   // modelData[0][1].shift();
            //   // modelData[0][0].shift();
            //   // modelData[0][2].shift();

            // }
            // console.log(modelData[0][1]);
            // console.log(modelData[0]);

            /**
             * 
             * Pushing data into Assetdata Variable as a Jagged Array
             * 
             */

            var lenas = object[0].asset_type_id_no.length;
            AssetData = new Array(lenas);
            var updateAssetId, updateAssetDesc;
            for (var i = 0; i < lenas; i++) {
              AssetData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].asset_type_id_no.length; i++) {
              for (var j = 0; j < 4; j++) {
                if (j == 0) {
                  AssetData[i].push(object[0].asset_type_id_no[i]);
                } else if (j == 1) {
                  AssetData[i].push('<center>' + object[0].asset_type_id_des[i] + '</center>');
                } else if (j == 2) {
                  AssetData[i].push('<center><a href="#" onclick="openPopup()" ng-model="asset_type_id_noup"><button class = "btn-success dim btn btn-sm btn-success abc  edit" ng-click="assetUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  AssetData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"  class="" ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="assetDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }


            /**
             * 
             * Pushing Data into mfgVariable As A Jagged Array
             * 
             */

            var lenmfg = object[0].mfg_id_no.length
            mfgData = new Array(lenmfg);
            for (var i = 0; i < lenmfg; i++) {
              mfgData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].mfg_id_no.length; i++) {
              for (var j = 0; j < 4; j++) {
                if (j == 0) {
                  mfgData[i].push(object[0].mfg_id_no[i]);
                } else if (j == 1) {
                  mfgData[i].push('<center>' + object[0].mfg_id_des[i] + '</center>');
                } else if (j == 2) {
                  mfgData[i].push('<center><a href="#"  onclick="openPopup2()"><button class = "btn-success dim btn btn-sm btn-success abc myBtn edit" ng-click="manufactureUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  mfgData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"   ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="manufactureDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }



            $scope.changeManufacture = function () {
              var mfg_alrd_prst;
              // alert("inside change function");
              for (i = 0; i < lenmfg; i++)
                // alert(mfgData[i][0]);

                if (mfgData[i][0] == $scope.mfg_id_no) {
                  // alert("id r same");
                  angular.element(document.getElementById('submitManufacture'))[0].disabled = true;
                  document.getElementById("submitManufacture").disabled = true;
                  // $scope.mfg_alrd_prst="Manufacture Id Already Exist";
                  // $('#mfgprst').text("Manufacture Id Already Exist");

                }

            }

            /**
             * 
             * Pushing Data into DepartentData VAriable 
             * 
             */

            var lenDept = object[0].department_id_no.length
            departmentData = new Array(lenDept);
            for (var i = 0; i < lenDept; i++) {
              departmentData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].department_id_no.length; i++) {
              for (var j = 0; j < 4; j++) {
                if (j == 0) {
                  departmentData[i].push(object[0].department_id_no[i]);
                } else if (j == 1) {
                  departmentData[i].push('<center>' + object[0].department_id_dec[i] + '</center>');
                } else if (j == 2) {
                  departmentData[i].push('<center><a href="#"  onclick="openPopup5()"><button class = "btn-success dim btn btn-sm btn-success abc myBtn edit" ng-click="departmentUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  departmentData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"   ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="departmentDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }



            /**
             * 
             * Pushing data Into SubdepartmentData variable
             * 
             */
            var lenSubDept = object[0].sub_department_id_no.length
            subDepartmentData = new Array(lenSubDept);
            for (var i = 0; i < lenSubDept; i++) {
              subDepartmentData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].sub_department_id_no.length; i++) {
              for (var j = 0; j < 4; j++) {
                if (j == 0) {
                  subDepartmentData[i].push(object[0].sub_department_id_no[i] );
                } else if (j == 1) {
                  subDepartmentData[i].push('<center>' + object[0].sub_department_id_dec[i] + '</center>');
                } else if (j == 2) {
                  subDepartmentData[i].push('<center><a href="#"  onclick="openPopup6()"><button class = "btn-success dim btn btn-sm btn-success abc myBtn edit" ng-click="subDepartmentUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  subDepartmentData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"   ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="subDepartmentDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }



            /**
             * 
             * Pushing data into priorityData variable
             * 
             */

            var lenPriort = object[0].priority_id_no.length
            priorityData = new Array(lenPriort);
            for (var i = 0; i < lenPriort; i++) {
              priorityData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].priority_id_no.length; i++) {
              for (var j = 0; j < 4; j++) {
                if (j == 0) {
                  priorityData[i].push( object[0].priority_id_no[i]);
                } else if (j == 1) {
                  priorityData[i].push('<center>' + object[0].priority_id_dec[i] + '</center>');
                } else if (j == 2) {
                  priorityData[i].push('<center><a href="#" onclick="openPopup7()"><button class = "btn-success dim btn btn-sm btn-success abc myBtn edit" ng-click="priorityUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  priorityData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"   ><button class = "btn-danger btn dim btn-sm btn-danger abc myBtn edit" ng-click="priorityDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }





            /**
             * 
             * Pushing data into locationTypeData variable
             * 
             */

            var assetMpngLen = object[0].problem_asset_mapping_asset_type_id.length
            assetMappingData = new Array(assetMpngLen);
            for (var i = 0; i < assetMpngLen; i++) {
              assetMappingData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].problem_asset_mapping_asset_type_id.length; i++) {
              for (var j = 0; j < 4; j++) {
                var index;
                if (j == 0) {
                  assetMappingData[i].push('<center>' + object[0].problem_asset_mapping_asset_type_id[i] + '</center>');
                } else if (j == 1) {
                  index = object[0].problem_id_no.indexOf(object[0].problem_asset_mapping_problem[i]);
                  // for (var k = 0; k < object[0].problem_id_no.length; k++) {
                  // if (object[0].problem_asset_mapping_problem[i] === object[0].problem_id_no[k]) {
                  assetMappingData[i].push('<center>' + object[0].problem_asset_mapping_problem[i] + "    -" + object[0].problem_id_desc[index] + '</center>');
                  // }
                  // }
                } else if (j == 2) {
                  assetMappingData[i].push('<center><a href="#"  onclick="openPopup17()"><button class = "btn-success dim btn btn-sm btn-success abc myBtn edit" ng-click="assetMappingUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  assetMappingData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"   ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="assetMappingDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }



            /**
             * 
             * Pushing data into locationTypeData variable
             * 
             */

            var lenlocTypeID = object[0].location_type_id.length
            locationTypeData = new Array(lenlocTypeID);
            for (var i = 0; i < lenlocTypeID; i++) {
              locationTypeData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].location_type_id.length; i++) {
              for (var j = 0; j < 4; j++) {
                if (j == 0) {
                  locationTypeData[i].push( object[0].location_type_id[i] );
                } else if (j == 1) {
                  locationTypeData[i].push('<center>' + object[0].location_type_id_desc[i] + '</center>');
                } else if (j == 2) {
                  locationTypeData[i].push('<center><a href="#" onclick="openPopup9()"><button class = "btn-success dim btn btn-sm btn-success abc myBtn edit" ng-click="locationUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  locationTypeData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"   ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="locationTypeDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }



            /**
             * 
             * Pushing data into rollData variable
             * 
             */

            var rollID = object[0].roll_id_no.length
            rollData = new Array(rollID);
            for (var i = 0; i < rollID; i++) {
              rollData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].roll_id_no.length; i++) {
              for (var j = 0; j < 5; j++) {
                if (j == 0) {
                  rollData[i].push(object[0].roll_id_no[i]);
                } else if (j == 1) {
                  rollData[i].push('<center>' + object[0].roll_id_desc[i] + '</center>');
                } else if (j == 2) {
                  rollData[i].push('<center>' + object[0].roll_time_multiplier[i] + '</center>');
                } else if (j == 3) {
                  rollData[i].push('<center><a href="#"  onclick="openPopup8()"><button class = "btn-success btn dim btn-sm btn-success abc myBtn edit" ng-click="rollUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  rollData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"   ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="rollDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }



            /**
             * 
             * Pushing data into escalationData variable
             * 
             */

            // var escLength=object[0].escalation_code.length
            // escalationData=new Array(escLength);
            // for(var i=0;i<escLength;i++){
            //   escalationData[i]=new Array(0);
            // }
            // for(var i=0;i<object[0].escalation_code.length;i++){
            //   for(var j=0;j<4;j++){
            //     if(j==0){
            //       escalationData[i].push(object[0].escalation_code[i]);
            //     }
            //     else if(j==1){
            //       escalationData[i].push(object[0].escalation_level[i]);
            //     }
            //     else if(j==2){
            //       escalationData[i].push(object[0].escalation_reassignment[i]);
            //     }
            //     else {
            //       escalationData[i].push('<center><a href="#" id="button-popup" onclick="openPopup16()"><button class = "btn-success btn btn-sm btn-success abc myBtn edit" ng-click="escalationUpdate('+i+')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
            //     }
            //   }
            // }


            /**
             * 
             * Pushing data into Shifts variable
             * 
             */

            var shiftLength = object[0].shifts.length
            shiftData = new Array(shiftLength);
            for (var i = 0; i < shiftLength; i++) {
              shiftData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].from.length; i++) {
              for (var j = 0; j < 5; j++) {
                if (j == 0) {
                  shiftData[i].push('<center>' + object[0].from[i] + '</center>');
                } else if (j == 1) {
                  shiftData[i].push('<center>' + object[0].to[i] + '</center>');
                } else if (j == 2) {
                  shiftData[i].push('<center>' + object[0].shifts[i] + '</center>');
                } else if (j == 3) {
                  shiftData[i].push('<center><a href="#"  onclick="openPopup18()"><button class = "btn-success btn dim btn-sm btn-success abc myBtn edit" ng-click="shiftUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  shiftData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"   ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="shiftDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }

            /**
             * 
             * Pushing data into notificationData variable
             * 
             */

            // var ntflength=object[0].notification_policy_code.length
            // notificationData=new Array(ntflength);
            // for(var i=0;i<ntflength;i++){
            //   notificationData[i]=new Array(0);
            // }
            // for(var i=0;i<object[0].notification_policy_code.length;i++){
            //   for(var j=0;j<5;j++){
            //     if(j==0){
            //       notificationData[i].push(object[0].notification_policy_code[i]);
            //     }
            //     else if(j==1){
            //       notificationData[i].push(object[0].notification_policy_name[i]);
            //     }
            //     else if(j==2){
            //       notificationData[i].push(object[0].notification_policy_time1[i]);
            //     }
            //     else if(j==3){
            //       notificationData[i].push(object[0].notification_policy_reminder[i]);
            //     }
            //     else {
            //       notificationData[i].push('<center><a href="#" id="button-popup" onclick="openPopup15()"><button class = "btn-success btn btn-sm btn-success abc myBtn edit" ng-click="notificationUpdate('+i+')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
            //     }
            //   }
            // }












            /**
             * 
             * Pushing data into problemData variable
             * 
             */



            var prblmID = object[0].problem_id_no.length
            problemData = new Array(prblmID);
            for (var i = 0; i < prblmID; i++) {
              problemData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].problem_id_no.length; i++) {
              for (var j = 0; j < 14; j++) {
                if (j == 0) {
                  problemData[i].push(  object[0].problem_id_no[i] );
                } else if (j == 1) {
                  problemData[i].push('<center>' + object[0].problem_id_desc[i] + '</center>');
                } else if (j == 2) {
                  problemData[i].push('<center>' + object[0].priority_id_no2[i] + '</center>');
                } else if (j == 3) {
                  problemData[i].push('<center>' + object[0].problem_time[i] + '</center>');
                } else if (j == 4) {
                  // for (var k = 0; k < object[0].problem_status.length; k++) {
                  if (object[0].problem_status[i] == "open") {
                    problemData[i].push('<span class="label label-success">Open</span>');
                  } else if (object[0].problem_status[i] == "closed") {
                    problemData[i].push('<span class="label label-danger">Closed</span>');
                  } else if (object[0].problem_status[i] == "inprogress") {
                    problemData[i].push('<span class="label label-info">Inprogress</span>');
                  } else if (object[0].problem_status[i] == "solved") {
                    problemData[i].push('<span class="label label-warning">Solved</span>');
                  }
                  // }
                  // problemData[i].push(object[0].problem_status[i]);
                } else if (j == 5) {
                  problemData[i].push('<center>' + object[0].notification_policy_reminder[i] + '</center>');
                } else if (j == 6) {
                  problemData[i].push('<center>' + "L" + (object[0].escalation_level[i]) + '</center>');
                } else if (j == 7) {
                  problemData[i].push('<center>' + object[0].escalation_hrs[i] + '</center>');
                }else if (j == 8) {
                  problemData[i].push('<center>' + object[0].comment_Header[i] + '</center>');
                }else if (j == 9) {
                  problemData[i].push('<center>' + object[0].comment_Suffix[i] + '</center>');
                }else if (j == 10) {
                  problemData[i].push('<center>' + object[0].comment_Prefix[i] + '</center>');
                }else if (j == 11) {
                  if(object[0].comment[i]==true){
                    problemData[i].push('<center>' + 'Required' + '</center>');

                  }
                  else
                  {
                  problemData[i].push('<center>' + 'Optional' + '</center>');
                    
                  }
                } else if (j == 12) {
                  problemData[i].push('<center><a href="#"  onclick="openPopup11()"><button class = "btn-success btn dim btn-sm btn-success abc myBtn edit" ng-click="problemUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  problemData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"   ><button class = "btn-danger btn dim btn-sm btn-danger abc myBtn edit" ng-click="problemDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }



            /**
             * 
             * Pushing data into employeeData variable
             * 
             */

            // var empID=object[0].employee_name.length;
            //   employeeData=new Array(empID);
            // for(var i=0;i<empID;i++){
            //   employeeData[i]=new Array(0);
            // }
            // for(var i=0;i<object[0].employee_name.length;i++){
            //   for(var j=1;j<7;j++){
            //     // if(j==0){
            //     //   employeeData[i].push(object[0].employee_id_no[i]);
            //     // }
            //      if(j==1){
            //       employeeData[i].push(object[0].employee_name[i]);
            //     }
            //     else if(j==2){
            //       employeeData[i].push(object[0].employee_id_dec[i]);
            //     }
            //     else if(j==3){
            //       employeeData[i].push(object[0].employee_mobile[i]);
            //     }
            //     else if(j==4){
            //       employeeData[i].push(object[0].employee_email[i]);
            //     }
            //     else if(j==5){
            //       employeeData[i].push(object[0].employee_reporting[i]);
            //     }
            //     else {
            //       employeeData[i].push('<center><a href="#" id="button-popup" onclick="openPopup4()"><button class = "btn-success btn btn-sm btn-success abc myBtn edit" ng-click="employeeUpdate('+i+')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
            //     }

            //   }
            // }


            /**
             * 
             * Pushing Data into userData variable
             * 
             */

            var userID = object[0].user_id_no.length
            userData = new Array(userID);
            for (var i = 0; i < userID; i++) {
              userData[i] = new Array(0);
            }
            for (var i = object[0].user_id_no.length - 1, k = 0; i >= 0, k < object[0].user_id_no.length; i--, k++) {
              for (var j = 0; j < 14; j++) {
                if (j == 0) {
                  userData[k].push( object[0].user_id_no[i] );
                } else if (j == 1) {
                  userData[k].push('<center>' + object[0].user_first_name[i] + '</center>');
                } else if (j == 2) {
                  userData[k].push('<center>' + object[0].user_last_name[i] + '</center>');
                } else if (j == 3) {
                  userData[k].push('<center>' + object[0].user_username[i] + '</center>');
                } else if (j == 4) {
                  userData[k].push('<center>' + object[0].user_id_desc[i] + '</center>');
                } else if (j == 5) {
                  if ($scope.userRoles == true) {
                    userData[k].push(object[0].user_mobile[i]);
                  } else {
                    if (object[0].user_mobile_privacy[i] === true) {
                      userData[k].push('<center>' + object[0].user_mobile[i] + '</center>');
                    } else {
                      userData[k].push('<center>' + "XXXXXXXXXX" + '</center>');
                    }
                  }
                } else if (j == 6) {
                  // var email=object[0].user_email[i].split('@');
                  userData[k].push('<center>' + object[0].user_email[i] + '</center>');
                } else if (j == 7) {
                  userData[k].push('<center>' + object[0].roll_id_no2[i] + '</center>');
                } else if (j == 8) {
                  userData[k].push('<center>' + object[0].user_reporting[i] + '</center>');
                } else if (j == 9) {
                  if (object[0].user_roll_admin[i] == true && object[0].user_roll_technician[i] == true && object[0].user_roll_user[i] == true) {
                    userData[k].push("Admin,User,Technician");
                  } else if (object[0].user_roll_admin[i] == true && object[0].user_roll_technician[i] == true && object[0].user_roll_user[i] == false) {
                    userData[k].push("Admin,Technician");
                  } else if (object[0].user_roll_admin[i] == true && object[0].user_roll_technician[i] == false && object[0].user_roll_user[i] == true) {
                    userData[k].push("Admin,User");
                  } else if (object[0].user_roll_admin[i] == true && object[0].user_roll_technician[i] == false && object[0].user_roll_user[i] == false) {
                    userData[k].push("Admin");
                  } else if (object[0].user_roll_admin[i] == false && object[0].user_roll_technician[i] == true && object[0].user_roll_user[i] == true) {
                    userData[k].push("User,Technician");
                  } else if (object[0].user_roll_admin[i] == false && object[0].user_roll_technician[i] == true && object[0].user_roll_user[i] == false) {
                    userData[k].push("Technician");
                  } else if (object[0].user_roll_admin[i] == false && object[0].user_roll_technician[i] == false && object[0].user_roll_user[i] == true) {
                    userData[k].push("User");
                  }
                } else if (j == 10) {
                  if (object[0].user_mobile_privacy[i] == true) {
                    userData[k].push("Visible");
                  } else {
                    userData[k].push("Invisible");
                  }
                } else if (j == 11) {
                  if (object[0].user_status[i] == 'Enable') {
                    userData[k].push('<span class="label badge-primary">Enabled</span>');
                  } else {
                    userData[k].push('<span class="label badge-danger">Disabled</span>');
                  }
                } else if (j == 12) {
                  userData[k].push('<center><a href="#"  onclick="openPopup12()"><button class = "btn-success btn dim btn-sm btn-success abc myBtn edit" ng-click="userUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  userData[k].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"  class="btn" ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="userDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }


            /**
             * 
             * Pushing data into locData variable
             * 
             */

            var locationID = object[0].location_id.length
            locData = new Array(locationID);
            for (var i = 0; i < locationID; i++) {
              locData[i] = new Array(0);
            }
            for (var i = 0; i < object[0].location_id.length; i++) {
              for (var j = 0; j < 9; j++) {
                if (j == 0) {
                  locData[i].push(object[0].location_id[i]);
                } else if (j == 1) {
                  locData[i].push('<center>' + object[0].name_of_the_location[i] + '</center>');
                } else if (j == 2) {
                  locData[i].push('<center>' + object[0].location_type_id2[i] + '</center>');
                } else if (j == 3) {
                  locData[i].push('<center>' + object[0].longitude[i] + '</center>');
                } else if (j == 4) {
                  locData[i].push('<center>' + object[0].latitude[i] + '</center>');
                } else if (j == 5) {
                  locData[i].push('<center>' + object[0].gmt_different[i] + '</center>');
                } else if (j == 6) {
                  locData[i].push('<center>' + object[0].under_location[i] + '</center>');
                } else if (j == 7) {
                  locData[i].push('<center><a href="#"  onclick="openPopup10()"><button class = "btn-success btn dim btn-sm btn-success abc myBtn edit" ng-click="locationDUpdate(' + i + ')"><i class="fa fa-pencil"></i>    Edit</button></a></center>');
                } else {
                  locData[i].push('<center> <a sweetalert sweet-options="{{sweet.option}}" sweet-confirm-option="{{sweet.confirm}}" sweet-cancel-option="{{sweet.cancel}}"  name="login-submit" sweet-on-cancel="checkCancel()" sweet-on-confirm="checkConfirm()"  class="btn" ><button class = "btn-danger dim btn btn-sm btn-danger abc myBtn edit" ng-click="locationDelete(' + i + ')"><i class="fa fa-trash-o"></i>    Delete</button></a></center>');
                }
              }
            }
          }







          /**
           * 
           * Functions For Dynamic Table change On the Button Click
           * 
           */

          $(document).ready(function () {
            console.log("ready!");
          });

          window.onload = function (e) {
            console.log("window.onload");
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/AssetData.xlsx'");

          }
          $('#AssetTable').click(function () {
            assetDataTable();
            $('#lblAssetName').text("Asset Table");
            // alert("inside asset click "+flag);
            PDFflag = 0;
            addDataFromFileFlag = 0;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/AssetData.xlsx'");
          });



          $('#notification').click(function () {
            notificationTable();
            $('#lblAssetName').text("Notification Table");
            // alert("inside asset click "+flag);
            PDFflag = 12;

          });

          $('#emailSubmit').click(function () {
            $('#addemaildiv').hide();
          });

          $('#escalation').click(function () {
            escalationTable();
            $('#lblAssetName').text("Escalation Table");

            // alert("inside asset click "+flag);
            PDFflag = 14;

          });

          $('#assetMapping').click(function () {
            $('#lblAssetName').text("Problem Asset Mapping Table");
            problemAssetMapping();
            addDataFromFileFlag = 11;

            PDFflag = 13;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/AssetMapping.xlsx'");

          });
          $('#assetAddition').click(function () {
            addDataFromFileFlag = 20;
           
          });
          


          $('#rollID').click(function () {
            rollTable();
            $('#lblAssetName').text("Role Table");
            PDFflag = 7;
            addDataFromFileFlag = 6;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/Roll.xlsx'");

          });

          $('#prblmId').click(function () {
            $('#lblAssetName').text("Problem Table");
            problemtable();
            PDFflag = 10;
            addDataFromFileFlag = 10;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/Problem.xlsx'");

          });

          $('#userID').click(function () {
            $('#lblAssetName').text("User Id Table");
            usertable();
            PDFflag = 11;
            addDataFromFileFlag = 9;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/User.xlsx'");

          });

          $('#vendorCompany').click(function () {
            $('#lblAssetName').text("Vendor Company Table");
            vendorTable();
            PDFflag = 12;
            addDataFromFileFlag = 12;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/VendorCompany.xlsx'");

          });

          $('#locId').click(function () {
            $('#lblAssetName').text("Location Id Table");

            location2table();
            PDFflag = 9;
            addDataFromFileFlag = 8;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/LocationID.xlsx'");

          });

          $('#emplID').click(function () {
            $('#lblAssetName').text("Employee Id Table");

            employeeTable();
            PDFflag = 3;
          });

          $('#priorityId').click(function () {
            $('#lblAssetName').text("Priority Table");

            priorityTable();
            PDFflag = 6;
            addDataFromFileFlag = 5;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/Priority.xlsx'");

          });

          $('#locTypeID').click(function () {
            $('#lblAssetName').text("Location type Table");

            locationTable();
            PDFflag = 8;
            addDataFromFileFlag = 7;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/LocationType.xlsx'");

          });

          $('#mdlTbl').click(function () {
            $('#lblAssetName').text("Model Table");

            modelTable();
            PDFflag = 2;
            addDataFromFileFlag = 2;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/ModelData.xlsx'");

          });

          $('#MfgTable').click(function () {
            $('#lblAssetName').text("Manufacture Table");

            manufactureTable();
            PDFflag = 1;
            addDataFromFileFlag = 1;
            //   $("#template").attr({
            //     "href" : "https://www.w3schools.com/jquery"
            //     // "title" : "W3Schools jQuery Tutorial"
            // });
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/Manufacture.xlsx'");
          });

          $('#deprtID').click(function () {
            $('#lblAssetName').text("Department Table");

            departmentTable();
            PDFflag = 4;
            addDataFromFileFlag = 3;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/Department.xlsx'");


          });

          $('#suDeptID').click(function () {
            $('#lblAssetName').text("Sub Department Table");

            subDepartmentTable();
            PDFflag = 5;
            addDataFromFileFlag = 4;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/SubDepartment.xlsx'");

          });

          $('#shiftstb').click(function () {
            $('#lblAssetName').text("Shifts Table");

            shiftsTable();
            PDFflag = 15;
            addDataFromFileFlag = 13;
            document.getElementById("template").setAttribute("onclick", "location.href='modules/sources/client/views/Template FIles/Shift.xlsx'");

          });

          $scope.generate = function () {
            // alert("inside PDF generator");

            /**
             * 
             * Generate PDF of Asset Table
             * 
             */

            if (PDFflag == 0) {
              var columns = [ {
                title: "AssetId",
                dataKey: "AssetId"
              },            {
                title: "Description",
                dataKey: "Description"
              },         ];        
              var rows = [];
              console.log(object[0].asset_type_id_no.length);
              for (var i = 0; i < object[0].asset_type_id_no.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'AssetId': object[0].asset_type_id_no[i],
                      'Description': object[0].asset_type_id_des[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Asset Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf");        
            }



            /**
             * 
             * Generate PDF of Manufacture Table
             * 
             */
            else if (PDFflag == 1) {
              var columns = [ {
                title: "Manufacture ID",
                dataKey: "ManufactureId"
              },            {
                title: "Description",
                dataKey: "Description"
              },         ];        
              var rows = [];
              console.log(object[0].mfg_id_no.length);
              for (var i = 0; i < object[0].mfg_id_no.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'ManufactureId': object[0].mfg_id_no[i],
                      'Description': object[0].mfg_id_des[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Manufacture Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf");        
            }


            /**
             * 
             * Generate PDF of Model Table
             * 
             */
            else if (PDFflag == 2) {
              var columns = [ {
                title: "Model ID",
                dataKey: "ModelId"
              },            {
                title: "Description",
                dataKey: "Description"
              },         ];  
              var rows = [];
              console.log(object[0].model_id_no.length);
              for (var i = 0; i < object[0].model_id_no.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'ModelId': object[0].model_id_no[i],
                      'Description': object[0].model_id_des[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Model Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }



            /**
             * 
             * Generate PDF of Employee Table
             * 
             */
            else if (PDFflag == 3) {
              var columns = [
                //     {title:"Employee ID", dataKey: "empId"}, 
                 {
                  title: "Employee Name",
                  dataKey: "empName"
                },            {
                  title: "Description",
                  dataKey: "Description"
                },             {
                  title: "Mobile",
                  dataKey: "Mobile"
                },              {
                  title: "Email",
                  dataKey: "Email"
                },              {
                  title: "Reporting",
                  dataKey: "Reporting"
                },          
              ];  
              var rows = [];
              console.log(object[0].employee_name.length);
              for (var i = 0; i < object[0].employee_name.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = { /* 'empId': object[0].employee_id_no[i], */
                      'empName': object[0].employee_name[i],
                      'Description': object[0].employee_id_dec[i],
                      'Mobile': object[0].employee_mobile[i],
                      'Email': object[0].employee_email[i],
                      'Reporting': object[0].employee_reporting[i]
                    }
                  }
                }
              }        
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Employee Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }



            /**
             * 
             * Generate PDF of Department Table
             * 
             */
            else if (PDFflag == 4) {
              var columns = [ {
                title: "Department ID",
                dataKey: "departmentID"
              },            {
                title: "Description",
                dataKey: "Description"
              },         ];  
              var rows = [];
              console.log(object[0].department_id_no.length);
              for (var i = 0; i < object[0].department_id_no.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'departmentID': object[0].department_id_no[i],
                      'Description': object[0].department_id_dec[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Department Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }


            /**
             * 
             * Generate PDF of Sub Department Table
             * 
             */
            else if (PDFflag == 5) {
              var columns = [ {
                title: "Sub Department ID",
                dataKey: "subDepartmentId"
              },            {
                title: "Description",
                dataKey: "Description"
              },         ];  
              var rows = [];
              console.log(object[0].sub_department_id_no.length);
              for (var i = 0; i < object[0].sub_department_id_no.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'subDepartmentId': object[0].sub_department_id_no[i],
                      'Description': object[0].sub_department_id_dec[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Sub Department Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }


            /**
             * 
             * Generate PDF of Priority Table
             * 
             */
            else if (PDFflag == 6) {
              var columns = [ {
                title: " Priority ID",
                dataKey: "priorityId"
              },            {
                title: "Description",
                dataKey: "Description"
              },         ];  
              var rows = [];
              console.log(object[0].priority_id_no.length);
              for (var i = 0; i < object[0].priority_id_no.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'priorityId': object[0].priority_id_no[i],
                      'Description': object[0].priority_id_dec[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text(" Priority Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }


            /**
             * 
             * Generate PDF of Roll Table
             * 
             */
            else if (PDFflag == 7) {
              var columns = [ {
                  title: " Roll ID",
                  dataKey: "rollId"
                },            {
                  title: "Description",
                  dataKey: "Description"
                },              {
                  title: "Roll Time Multiplier",
                  dataKey: "rollTM"
                },   

                      
              ];  
              var rows = [];
              console.log(object[0].roll_id_no.length);
              for (var i = 0; i < object[0].roll_id_no.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'rollId': object[0].roll_id_no[i],
                      'Description': object[0].roll_id_desc[i],
                      'rollTM': object[0].roll_time_multiplier[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text(" Roll Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }

            /**
             * 
             * Generate PDF of Location Type Table
             * 
             */
            else if (PDFflag == 8) {
              var columns = [ {
                  title: " Loaction ID",
                  dataKey: "locId"
                },            {
                  title: "Description",
                  dataKey: "Description"
                },   

                      
              ];  
              var rows = [];
              console.log(object[0].location_type_id.length);
              for (var i = 0; i < object[0].location_type_id.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'locId': object[0].location_type_id[i],
                      'Description': object[0].location_type_id_desc[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text(" Location Type Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }


            /**
             * 
             * Generate PDF of Location Table
             * 
             */
            else if (PDFflag == 9) {
              var columns = [ {
                  title: "Location ID",
                  dataKey: "locId"
                },            {
                  title: "Name",
                  dataKey: "name"
                },             {
                  title: "LocType",
                  dataKey: "locType"
                },              {
                  title: "Longitude",
                  dataKey: "longitude"
                },              {
                  title: "Latitude",
                  dataKey: "latitude"
                },   
                //           {title:"Altitude", dataKey: "Altitude"}, 
                           {
                  title: "GMT Diffrent",
                  dataKey: "gmt"
                },              {
                  title: "Under Location",
                  dataKey: "undrLoc"
                },   

                      
              ];  
              var rows = [];
              console.log(object[0].location_id.length);
              for (var i = 0; i < object[0].location_id.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'locId': object[0].location_id[i],
                      'name': object[0].name_of_the_location[i],
                      'locType': object[0].location_type_id2[i],
                      'longitude': object[0].longitude[i],
                      'latitude': object[0].latitude[i],
                      /* 'Altitude': object[0].altitude[i], */
                      'gmt': object[0].gmt_different[i],
                      'undrLoc': object[0].under_location[i]
                    }
                  }
                }
              }        
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Location Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }


            /**
             * 
             * Generate PDF of Problem Table
             * 
             */
            else if (PDFflag == 10) {
              var columns = [ {
                title: "Problem ID",
                dataKey: "prblmId"
              },            {
                title: "Description",
                dataKey: "Description"
              },             {
                title: "Priority Type",
                dataKey: "priorityType"
              },            {
                title: "Problem Time",
                dataKey: "prblmTime"
              },            {
                title: "Notification Remainder",
                dataKey: "ntfkey"
              },              {
                title: "Escalation Lavel",
                dataKey: "eTime"
              },              {
                title: "Escalation Time",
                dataKey: "esclcode"
              },            ];  
              var rows = [];
              console.log(object[0].problem_id_no.length);
              for (var i = 0; i < object[0].problem_id_no.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'prblmId': object[0].problem_id_no[i],
                      'Description': object[0].problem_id_desc[i],
                      'eTime': object[0].escalation_level[i],
                      'priorityType': object[0].priority_id_no2[i],
                      'ntfkey': object[0].notification_policy_reminder[i],
                      'esclcode': object[0].escalation_hrs[i],
                      'prblmTime': object[0].problem_time[i]
                    }
                  }
                }
              }        
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Problem Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }



            /**
             * 
             * Generate PDF of User Table
             * 
             */
            else if (PDFflag == 11) {
              var columns = [ {
                  title: "User ID",
                  dataKey: "usrId"
                },            {
                  title: " Name",
                  dataKey: "fname"
                },              {
                  title: "Client Id",
                  dataKey: "lname"
                },              {
                  title: "User Name",
                  dataKey: "uname"
                },   
                //           {title:"Last Name", dataKey: "lname"},  

                           {
                  title: "Description",
                  dataKey: "Description"
                },             {
                  title: "Mobile",
                  dataKey: "Mobile"
                },              {
                  title: "Email",
                  dataKey: "Email"
                },              {
                  title: "Roll",
                  dataKey: "roll"
                },              {
                  title: "Reporting To",
                  dataKey: "rprt"
                },   

                           {
                  title: "User Type",
                  dataKey: "utype"
                },             {
                  title: "Mobile Privacy",
                  dataKey: "mprivacy"
                },              {
                  title: " Account Status",
                  dataKey: "astatus"
                },    

                       
              ];  
              var rows = [];
              console.log(object[0].user_id_no.length);
              var userType;
              for (var i = 0; i < object[0].user_id_no.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) {
                    if (object[0].user_roll_admin[i] == true && object[0].user_roll_technician[i] == true && object[0].user_roll_user[i] == true) {
                      userType = "Admin,User,Technician";
                    } else if (object[0].user_roll_admin[i] == true && object[0].user_roll_technician[i] == true && object[0].user_roll_user[i] == false) {
                      userType = "Admin,Technician";
                    } else if (object[0].user_roll_admin[i] == true && object[0].user_roll_technician[i] == false && object[0].user_roll_user[i] == true) {
                      userType = "Admin,User";
                    } else if (object[0].user_roll_admin[i] == true && object[0].user_roll_technician[i] == false && object[0].user_roll_user[i] == false) {
                      userType = "Admin";
                    } else if (object[0].user_roll_admin[i] == false && object[0].user_roll_technician[i] == true && object[0].user_roll_user[i] == true) {
                      userType = "User,Technician";
                    } else if (object[0].user_roll_admin[i] == false && object[0].user_roll_technician[i] == true && object[0].user_roll_user[i] == false) {
                      userType = "Technician";
                    } else if (object[0].user_roll_admin[i] == false && object[0].user_roll_technician[i] == false && object[0].user_roll_user[i] == true) {
                      userType = "User";
                    }
                    // if($scope.userRoles==true){
                     
                    rows[i] = {
                      'usrId': object[0].user_id_no[i],
                      'Description': object[0].user_id_desc[i],
                      'Mobile': object[0].user_mobile[i],
                      'Email': object[0].user_email[i],
                      'roll': object[0].roll_id_no2[i],
                      'rprt': object[0].user_reporting[i],
                      'mprivacy': object[0].user_mobile_privacy[i],
                      'fname': object[0].user_first_name[i],
                      'astatus': object[0].user_status[i],
                      'lname': object[0].user_last_name[i],
                      'uname': object[0].user_username[i],
                      'utype': userType
                    }
                    // }
                    // else{
                    //     rows[i] = { 'usrId': object[0].user_id_no[i],'Description': object[0].user_id_desc[i],'Mobile': 'XXXXXXXXXX','Email': object[0].user_email[i],'roll': object[0].roll_id_no2[i],'rprt': object[0].user_reporting[i],'fname': object[0].user_first_name[i],'lname': object[0].user_last_name[i],'uname': object[0].user_username[i],'utype': userType}
                    // }
                  }
                }
              }        
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("User Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }



            /**
             * 
             * Generate PDF of Asset Mapping Table
             * 
             */
            else if (PDFflag == 13) {
              var columns = [ {
                title: "Asset Type ID",
                dataKey: "assettId"
              },            {
                title: "Problem",
                dataKey: "problem"
              },         ];  
              var rows = [];
              console.log(object[0].problem_asset_mapping_asset_type_id.length);
              for (var i = 0; i < object[0].problem_asset_mapping_asset_type_id.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'assettId': object[0].problem_asset_mapping_asset_type_id[i],
                      'problem': object[0].problem_asset_mapping_problem[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Asset Mapping Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }



            /**
             * 
             * Generate PDF of Asset Mapping Table
             * 
             */
            else if (PDFflag == 14) {
              var columns = [ {
                title: "Escalation Code",
                dataKey: "escltnCode"
              },            {
                title: "Escalation Lavel",
                dataKey: "escltnLavel"
              },             {
                title: "Escalation Reassignment",
                dataKey: "escltnReassignment"
              },          ];  
              var rows = [];
              console.log(object[0].escalation_code.length);
              for (var i = 0; i < object[0].escalation_code.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'escltnCode': object[0].escalation_code[i],
                      'escltnLavel': object[0].escalation_level[i],
                      'escltnReassignment': object[0].escalation_reassignment[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Escalation Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }
            /**
             * 
             * Generate PDF of Asset Mapping Table
             * 
             */
            else if (PDFflag == 12) {
              var columns = [ {
                  title: "Notification Policy Code",
                  dataKey: "ntfctnCode"
                },            {
                  title: "Notification Policy Name",
                  dataKey: "ntfctnName"
                },             {
                  title: "Notification Policy Time",
                  dataKey: "ntfctnTime"
                },              {
                  title: "Notification Policy Reminder",
                  dataKey: "ntfctnReminder"
                },   

                       
              ];  
              var rows = [];
              console.log(object[0].notification_policy_code.length);
              for (var i = 0; i < object[0].notification_policy_code.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'ntfctnCode': object[0].notification_policy_code[i],
                      'ntfctnName': object[0].notification_policy_name[i],
                      'ntfctnTime': object[0].notification_policy_time1[i],
                      'ntfctnReminder': object[0].notification_policy_reminder[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Notification Policy Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }



            /**
             * 
             * Generate PDF of Asset Mapping Table
             * 
             */
            else if (PDFflag == 15) {
              var columns = [ {
                  title: "From",
                  dataKey: "from"
                },            {
                  title: "To",
                  dataKey: "to"
                },             {
                  title: "Shift  ",
                  dataKey: "shift"
                },   

                       
              ];  
              var rows = [];
              console.log(object[0].from.length);
              for (var i = 0; i < object[0].from.length; i++) {
                for (var j = 0; j < 3; j++) {
                  if (j == 0) { 
                    rows[i] = {
                      'from': object[0].from[i],
                      'to': object[0].to[i],
                      'shift': object[0].shifts[i]
                    }
                  }
                }
              }        
              console.log(rows);

                      
              var pdfsize = 'a0';        
              var doc = new jsPDF('l', 'pt', pdfsize);        
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth() + 1; //January is 0!
              var yyyy = today.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              var today = dd + '/' + mm + '/' + yyyy;
              console.log(today);        
              var res = doc.autoTableHtmlToJson(document.getElementById("example"), false);        
              doc.setFontSize(50);        
              doc.autoTable(columns, rows, {             //startY: 60,
                            
                theme: 'grid',
                            styles: {              
                  overflow: 'linebreak',
                                fontSize: 30,
                                // rowHeight: 60,
                                 //cellPadding:20,    
                                // columnWidth: 'wrap'
                              
                },
                            margin: {
                  top: 160
                },
                              columnStyles: {               //1: {columnWidth: 'auto'}
                                
                  columnWidth: 100                
                },
                            addPageContent: function (data) {              
                  doc.text("Shift Table", 30, 80);              
                  doc.text("Date :" + today, 2900, 80);            
                }            
              });          
              doc.save("table.pdf"); 
            }







          }

          /**
           * 
           * Changeing the DOM after updating and inserting data in the table
           * 
           */
          if (flag == 0) {
            $(document).ready(function () {
              // alert( "document loaded" );
              $('#lblAssetName').text("Asset Table");

              assetDataTable();

            });
          } else if (flag == 20) {
            $(document).ready(function () {
              // alert( "document loaded" );
              $('#lblAssetName').text("Vendor Company Table");

              vendorTable();

            });
          } else if (flag == 1) {
            $(document).ready(function () {
              $('#lblAssetName').text("Manufacture Table");

              // alert("Document ready for manufacture");
              manufactureTable();
            });
          } else if (flag == 2) {
            $(document).ready(function () {
              // alert("Document ready for Model");
              $('#lblAssetName').text("Model Table");

              modelTable();
            });
          } else if (flag == 3) {
            $(document).ready(function () {
              // alert("Document ready for Employee");
              $('#lblAssetName').text("Employee Id Table");

              employeeTable();
            });
          } else if (flag == 4) {
            $(document).ready(function () {
              // alert("Document ready for Department");
              $('#lblAssetName').text("Department Table");

              departmentTable();
            });
          } else if (flag == 5) {
            $(document).ready(function () {
              // alert("Document ready for Sub Department");
              $('#lblAssetName').text("Sub Department Table");

              subDepartmentTable();
            });
          } else if (flag == 6) {
            $(document).ready(function () {
              // alert("Document ready for Priority");
              $('#lblAssetName').text("Priority Table");

              priorityTable();
            });
          } else if (flag == 7) {
            $(document).ready(function () {
              // alert("Document ready for Roll");
              $('#lblAssetName').text("Roll Table");

              rollTable();
            });
          } else if (flag == 8) {
            $(document).ready(function () {
              // alert("Document ready for Location Type");
              $('#lblAssetName').text("Location type Table");

              locationTable();
            });
          } else if (flag == 9) {
            $(document).ready(function () {
              // alert("Document ready for Location");
              $('#lblAssetName').text("Location Id Table");

              location2table();
            });
          } else if (flag == 10) {
            $(document).ready(function () {
              // alert("Document ready for Problem");
              $('#lblAssetName').text("Problem Table");

              problemtable();
            });
          } else if (flag == 11) {
            $(document).ready(function () {
              // alert("Document ready for User");
              $('#lblAssetName').text("User Id Table");

              usertable();
            });
          } else if (flag == 12) {
            $(document).ready(function () {
              // alert("Document ready for User");
              $('#lblAssetName').text("Escalation Table");

              escalationTable();
            });
          } else if (flag == 13) {
            $(document).ready(function () {
              // alert("Document ready for User");
              $('#lblAssetName').text("Problem Asset Mapping Table");

              problemAssetMapping();
            });
          } else if (flag == 14) {
            $(document).ready(function () {
              // alert("Document ready for User");
              $('#lblAssetName').text("Notification Table");

              notificationTable();
            });
          } else if (flag == 15) {
            $(document).ready(function () {
              // alert("Document ready for User");
              $('#lblAssetName').text("Shift Table");
              shiftsTable();
            });
          }



          setTimeout(function () {
            $("#mytable").load("#mytable");
          }, 2000);
          $(function () {
            var appendthis = ("<div class='modal-overlay js-modal-close'></div>");
            $('a[data-modal-id]').on('click', function (e) {
              e.preventDefault();
              $("body").append(appendthis);
              $(".modal-overlay").fadeTo(10, 0.7);
              //$(".js-modalbox").fadeIn(500);
              var modalBox = $(this).attr('data-modal-id');
              $('#' + modalBox).fadeIn($(this).data());
            });


            $(".js-modal-close, .modal-overlay").click(function () {
              $(".modal-box, .modal-overlay").fadeOut(10, function () {
                $(".modal-overlay").remove();
              });
            });

            $(window).resize(function () {
              $(".modal-box").css({
                top: ($(window).height() - $(".modal-box").outerHeight()) / 2,
                left: ($(window).width() - $(".modal-box").outerWidth()) / 3
              });
              $(".modal-box2").css({
                top: ($(window).height() - $(".modal-box").outerHeight()) / 6,
                left: ($(window).width() - $(".modal-box").outerWidth()) / 3
              });
              // $(".modal-box3").css({
              //   top: ($(window).height() + $(".modal-box").outerHeight()) /20,
              //   left: ($(window).width() - $(".modal-box").outerWidth()) / 3
              // });
              // $(".btn-group").css({
              //   top: ($(window).height() - $(".modal-box").outerHeight()) / 7,
              //   left: ($(window).width() - $(".modal-box").outerWidth()) / 1.05
              // });
            });

            $(window).resize();
            $(function () {
              $(".reportingTo").chosen({
                width: "100%",
              });
              $(".ntf").chosen({
                width: "87%",
                // height:"10%"
              });
              $(".reportingToUpd").chosen({
                width: "100%",
              });
              $(".reportingTo2").chosen({
                width: "100%",
              });
              $(".prblmAssetId").chosen({
                width: "100%",
              });
              $(".prblmNo").chosen({
                width: "100%",
              });

              $(".notifctnCode").chosen({
                width: "100%",
              });
              $(".mobileprivacy").chosen({
                width: "100%",
              });
              $(".escltnCode").chosen({
                width: "100%",
              });


              $(".locType").chosen({
                width: "100%",
              });
              $(".underLoc").chosen({
                width: "100%",
              });
              $(".prtType").chosen({
                width: "87%",
              });
              $(".rollId").chosen({
                width: "100%",
              });
              $(".chzn-select").chosen({
                width: "100%",
              });
              $(".chzn-select2").chosen({
                width: "97%"
              });
              $(".chzn-select3").chosen({
                width: "85%"
              });
              $(".DPID").chosen({
                width: "85%"
              });
              $(".MFID").chosen({
                width: "85%"
              });
              $(".chzn-select5").chosen({ //chzn 5
                width: "85%"
              });
              $(".ATID").chosen({
                width: "85%"
              });
              $(".MDID2").chosen({
                width: "85%"
              });
              $(".ASAST").chosen({
                width: "87%"
              });
              $(".SDID").chosen({
                width: "85%"
              });
              $(".prtTypet").chosen({
                width: "87%"
              });
              $(".LTID").chosen({
                width: "85%"
              });

              $(".chzn-select4").chosen({
                width: "85%"
              });
              $(".chzn-selectvendor").chosen({
                width: "85%"
              });
              $(".LCID").chosen({ //chzn 5
                width: "85%"
              });
              $(".EMPID").chosen({ //chzn 5
                width: "85%"
              });
              $(".ecllvl").chosen({ //chzn 5
                width: "87%"
              });
              $(".comment").chosen({ //chzn 5
                width: "87%"
              });
            });
          });
        }
      }, 1900)
    }

    // $scope.dataTablesAlert = function(i) {
    // alert("inside Datatable");
    // alert(i);

    // }  
    // $scope.editAsset=function(i){
    //   alert("index is  "+i);
    //   alert("asset type id no "+object[0].asset_type_id_no[i]);
    //   alert("asset type des "+object[0].asset_type_id_des[i]);
    // }
    // $scope.editManufacture=function(i){
    //   alert("index is  "+i);
    //   $("#popup").modal();  
    //   alert("asset type id no "+object[0].mfg_id_no[i]);
    //   alert("asset type des "+object[0].mfg_id_des[i]);
    // }


    // $( document ).ready(function() {
    // // alert( "document loaded" );
    // $('#addEmail').click(function() {
    //   assetDataTable();
    //   $('#lblAssetName').text("Asset Table");

    //   // alert("inside asset click "+flag);
    // });
    // $('#addEmail').click(function(){
    //   alert("clicked on add");

    // });
    // $('#lblAssetName').text("Asset Table");

    // assetDataTable();

    // });

    $scope.bindData = function (isVa) {
      // alert("inside bind data");
      // alert($scope.source23);
      $scope.source_asset_id_no = $scope.object3.source_asset_id_no;
      // $scope.source_asset_type_id_no=$scope.source_asset_type_id_no;
      $scope.tag_id = $scope.object3.tag_id;

      // alert($scope.source_mfg_id_no);
      if (typeof $scope.source_mfg_id_no == "undefined" || $scope.source_mfg_id_no == null || $scope.source_mfg_id_no == "") {
        // alert("inside bind data source mfg id");
        // alert(mfgId);
        $scope.source_mfg_id_no = mfgId;
      } else {
        $scope.source_mfg_id_no = $scope.source_mfg_id_no;
      }


      if ($scope.source_sub_department_id_no == undefined || $scope.source_sub_department_id_no == null || $scope.source_sub_department_id_no == "") {
        $scope.source_sub_department_id_no = subDeptId;
      } else {
        $scope.source_sub_department_id_no = $scope.source_sub_department_id_no;
      }


      if ($scope.source_location_type_id == undefined || $scope.source_location_type_id == null || $scope.source_location_type_id == "") {
        $scope.source_location_type_id = locTID;
      } else {
        $scope.source_location_type_id = $scope.source_location_type_id;
      }


      // if($scope.source_employee_id_no==undefined||$scope.source_employee_id_no==null||$scope.source_employee_id_no=="")
      // {
      //   $scope.source_employee_id_no=empID;
      // }
      // else{
      //   $scope.source_employee_id_no=$scope.source_employee_id_no;
      // }


      if ($scope.source_asset_type_id_no == undefined || $scope.source_asset_type_id_no == null || $scope.source_asset_type_id_no == "") {
        $scope.source_asset_type_id_no = assetTID;
      } else {
        $scope.source_asset_type_id_no = $scope.source_asset_type_id_no;
      }


      if ($scope.source_department_id_no == undefined || $scope.source_department_id_no == null || $scope.source_department_id_no == "") {
        $scope.source_department_id_no = deptID;
      } else {
        $scope.source_department_id_no = $scope.source_department_id_no;

      }

      if ($scope.source_location_id == undefined || $scope.source_location_id == null || $scope.source_location_id == "") {
        $scope.source_location_id = locID;
      } else {
        $scope.source_location_id = $scope.source_location_id;
      }

      if ($scope.source_model_id_no == undefined || $scope.source_model_id_no == null || $scope.source_model_id_no == "") {
        // alert("inside bind data source mfg id");
        // alert(mfgId);
        $scope.source_model_id_no = mdlID;
      } else {
        $scope.source_model_id_no = $scope.source_model_id_no;
      }

      if ($scope.source_asset_type == undefined || $scope.source_asset_type == null || $scope.source_asset_type == "") {
        // alert("inside bind data source mfg id");
        // alert(mfgId);
        $scope.source_asset_type = asset_type;
      } else {
        $scope.source_asset_type = $scope.source_asset_type;
      }

      if ($scope.user_notify_to == undefined || $scope.user_notify_to == null || $scope.user_notify_to == "") {
        // alert("inside bind data source mfg id");
        // alert(mfgId);
        $scope.user_notify_to = notifyto;
      } else {
        $scope.user_notify_to = $scope.user_notify_to;
      }
      if ($scope.source_user_id_no == undefined || $scope.source_user_id_no == null || $scope.source_user_id_no == "") {
        // alert("inside bind data source mfg id");
        // alert(mfgId);
        $scope.source_user_id_no = userid;
      } else {
        $scope.source_user_id_no = $scope.source_user_id_no;
      }


      if ($scope.vendor_Company_id == undefined || $scope.vendor_Company_id == null || $scope.vendor_Company_id == "") {
        // alert("inside bind data source mfg id");
        // alert(mfgId);
        $scope.vendor_Company_id = vendorCompanyId;
      } else {
        $scope.vendor_Company_id = $scope.vendor_Company_id;
      }
      // if($scope.source_model_id_no==undefined||$scope.source_model_id_no==null||$scope.source_model_id_no=="")
      // {
      //   $scope.source_model_id_no=mdlID;
      // }
      // else{
      //   $scope.source_model_id_no=$scope.source_model_id_no;
      // }

      $scope.source_installation_date = $scope.object3.source_installation_date;
      $scope.source_last_service = $scope.object3.source_last_service;
      $scope.source_next_service = $scope.object3.source_next_service;
      $scope.source_amc_expr = $scope.object3.source_amc_expr;

      $scope.updateSourceAddtion();
    }

    $scope.createSourceAddition = function (isValid) {
      $scope.required = true;
      // alert("inside Source Addition function");
      var source_Additions = new Sources({
        source_asset_id_no: this.source_asset_id_no,
        source_asset_type_id_no: this.source_asset_type_id_no,
        tag_id: this.tag_id,
        source_mfg_id_no: this.source_mfg_id_no,
        source_model_id_no: this.source_model_id_no,
        source_sub_department_id_no: this.source_sub_department_id_no,
        source_location_type_id: this.source_location_type_id,
        source_department_id_no: this.source_department_id_no,
        source_location_id: this.source_location_id,
        source_installation_date: this.source_installation_date,
        source_last_service: this.source_last_service,
        source_next_service: this.source_next_service,
        source_amc_expr: this.source_amc_expr,
        source_user_id_no: this.source_user_id_no,
        user: this.user,
        clientId: this.clientId,
        user_notify_to: this.user_notify_to,
        source_asset_type: this.source_asset_type,
        vendor_Company_id: this.vendor_Company_id
      });
      source_Additions.user = Authentication.user._id;
      source_Additions.source_asset_id_no = $scope.source_asset_id_no;

      if ($scope.source_asset_type_id_no == undefined || $scope.source_asset_type_id_no == '' || $scope.source_asset_type_id_no == null) {
        $scope.source_asset_type_id_no = assetTID;//If user Will Not change DAta in the Choosen Plugin it will Add DAta from Edit function BCZ( Choosen will not bind $scope data  so MAnually binding data)
      } else {
        source_Additions.source_asset_type_id_no = $scope.source_asset_type_id_no;
      }

      if ($scope.source_mfg_id_no == undefined || $scope.source_mfg_id_no == null || $scope.source_mfg_id_no == '') {
        $scope.source_mfg_id_no = mfgId;
      } else {
        source_Additions.source_mfg_id_no = $scope.source_mfg_id_no;
      }

      if ($scope.source_model_id_no == undefined || $scope.source_model_id_no == '' || $scope.source_model_id_no == null) {
        $scope.source_model_id_no = mdlID;
      } else {
        source_Additions.source_model_id_no = $scope.source_model_id_no;
      }

      if ($scope.source_department_id_no == undefined || $scope.source_department_id_no == '' || $scope.source_department_id_no == null) {
        $scope.source_department_id_no = deptID;
      } else {
        source_Additions.source_department_id_no = $scope.source_department_id_no;
      }

      if ($scope.source_sub_department_id_no == undefined || $scope.source_sub_department_id_no == '' || $scope.source_sub_department_id_no == null) {
        $scope.source_sub_department_id_no = subDeptId;
      } else {
        source_Additions.source_sub_department_id_no = $scope.source_sub_department_id_no;
      }
      if ($scope.source_location_id == undefined || $scope.source_location_id == '' || $scope.source_location_id == null) {
        $scope.source_location_id = locID;

      } else {
        source_Additions.source_location_id = $scope.source_location_id;
      }

      if ($scope.source_location_type_id == undefined || $scope.source_location_type_id == '' || $scope.source_location_type_id == null) {
        $scope.source_location_type_id = locTID;

      } else {
        source_Additions.source_location_type_id = $scope.source_location_type_id;
      }

      source_Additions.tag_id = $scope.tag_id;

      if ($scope.source_user_id_no == undefined || $scope.source_user_id_no == '' || $scope.source_user_id_no == null) {
        $scope.source_user_id_no = userid;
      } else {
        source_Additions.source_user_id_no = $scope.source_user_id_no;
      }

      if ($scope.user_notify_to == undefined || $scope.user_notify_to == '' || $scope.user_notify_to == null) {
        $scope.user_notify_to = notifyto;
      } else {
        source_Additions.user_notify_to = $scope.user_notify_to;
      }
      // alert(vendorCompanyId)
      // alert($scope.vendor_Company_id);
      if ($scope.vendor_Company_id === undefined || $scope.vendor_Company_id == '' || $scope.vendor_Company_id == null) {
        // alert('inside if');

        $scope.vendor_Company_id = vendorCompanyId;
      } else {
        // alert('else');

        source_Additions.vendor_Company_id = $scope.vendor_Company_id;
      }


      if ($scope.source_asset_type === undefined || $scope.source_asset_type == '' || $scope.source_asset_type == null) {

        $scope.source_asset_type = asset_type;
      } else {
        source_Additions.source_asset_type = $scope.source_asset_type;
      }
      // source_Additions.source_model_id_no = $scope.source_model_id_no;
      // alert("inside Source Add");
      // alert($scope.source_model_id_no);
      source_Additions.vendor_Company_id = $scope.vendor_Company_id;
      source_Additions.source_asset_type = $scope.source_asset_type;
      source_Additions.user_notify_to = $scope.user_notify_to;
      source_Additions.source_user_id_no = $scope.source_user_id_no;
      source_Additions.source_location_type_id = $scope.source_location_type_id;
      source_Additions.source_location_id = $scope.source_location_id;
      source_Additions.source_sub_department_id_no = $scope.source_sub_department_id_no;
      source_Additions.source_department_id_no = $scope.source_department_id_no;
      source_Additions.source_model_id_no = $scope.source_model_id_no;
      source_Additions.source_mfg_id_no = $scope.source_mfg_id_no;
      source_Additions.source_asset_type_id_no = $scope.source_asset_type_id_no;

      // source_Additions.source_location_id = $scope.source_location_id;
      source_Additions.source_installation_date = $scope.source_installation_date;
      // alert($scope.source_installation_date);
      source_Additions.source_last_service = $scope.source_last_service;
      source_Additions.source_next_service = $scope.source_next_service;
      source_Additions.source_amc_expr = $scope.source_amc_expr;
      source_Additions.clientId = Authentication.user.lastName;
      // source_Additions.user_notify_to = $scope.user_notify_to;
      // source_Additions.vendor_Company_id = $scope.vendor_Company_id;
      console.log($scope.vendor_Company_id);
      // source_Additions.source_asset_type = $scope.source_asset_type;
      source_Additions.messageType = "AddSourceAddition";
      source_Additions.$save(function (response) {
        console.log("client controller redirect after save")
        console.log("inside the sourceAdition");
        console.log(typeof source_Additions);
        console.log(source_Additions);
        console.log("this is response")
        console.log(response);
        // alert("1 create");
        //$scope.object2=response;//1 create
        console.log("this is object Two");
        console.log(object2);
        // $scope.findSA();
        // Clear form fields
        // initSA();
        $scope.findSA();
        datatable_destroy2();
        // $( document ).ready(function() {
        initSA();
        // $scope.initDataTableSA();
        $scope.clearSA();
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    }

    function clearSourceAddition() {
      $scope.required = true;
      $scope.source_asset_id_no = '';
      $scope.source_asset_type_id_no = '';
      $scope.tag_id = '';
      $scope.source_mfg_id_no = '';
      $scope.source_model_id_no = '';
      $scope.source_sub_department_id_no = '';
      $scope.source_location_type_id = '';
      $scope.source_department_id_no = '';
      $scope.source_location_id = '';
      $scope.source_installation_date = '';
      $scope.source_last_service = '';
      $scope.source_next_service = '';
      $scope.source_amc_expr = '';
      $scope.source_employee_id_no = '';
      // $scope.sourceForm.$setPristine();
      // $scope.sourceForm.$setUntouched();
      // $scope.sourceForm2.$setPristine();
      // $scope.sourceForm2.$setUntouched();
    }


    $scope.checkUsername = function (isValid) {
      var users2;
      var user = new Sources();
      user.messageType = "checkUserName";
      user.$save(function (response) {
        users2 = response.data;
        $scope.userAvlbl = response.data;
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
        alert(error);
      });
      $scope.checkUserNamefn = function () {
        var userFlag = 0;
        for (var i = 0; i < users2.length; i++) {
          // alert(users2[i].username);
          if (users2[i].username == $scope.user_username) {
            $scope.checkusernamepresent = "Username Already Exist";
            userFlag = 1;
          }

          if (userFlag == 1) {
            $scope.checkuser = true;
          } else {
            $scope.checkusernamepresent = "";
            $scope.checkuser = false;
          }
        }
      }

      $scope.copyPrblm = function () {
        $scope.required = false;
        $scope.problem_id_no = '';
        $(".prtTypet").val(prioritytype).trigger("chosen:updated");
        $(".ecllvl").val(esclcode).trigger("chosen:updated");
        $(".prtType").val(prblmstatus).trigger("chosen:updated");
      }
      $scope.checkMail = function () {
        var userFlag = 0;
        for (i = 0; i < users2.length; i++) {
          if (users2[i].email == $scope.user_email) {
            $scope.checkemailpresent = "Email Already Exist";
            userFlag = 1;
          }

          if (userFlag == 1) {
            $scope.checkuser = true;
          } else {
            $scope.checkemailpresent = "";
            $scope.checkuser = false;
          }
        }
      }
    }

    // Create new Source
    $scope.create = function (isValid) {
      $scope.required = true;

      // flag=0;
      // alert("inside create");
      console.log("client sources create controller")
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'sourceForm');
        console.log("true...")
        return false;
      }

      // Create new Source object
      console.log("client controller create new source object")
      var source = new Sources({
        asset_type_id_no: this.asset_type_id_no,
        asset_type_id_des: this.asset_type_id_des,
        mfg_id_no: this.mfg_id_no,
        mfg_id_des: this.mfg_id_des,
        model_id_no: this.model_id_no,
        model_id_des: this.model_id_des,
        // employee_id_no: this.employee_id_no,
        employee_id_dec: this.employee_id_dec,
        employee_mobile: this.employee_mobile,
        employee_email: this.employee_email,
        employee_name: this.employee_name,
        user_reporting: this.user_reporting,
        department_id_no: this.department_id_no,
        department_id_dec: this.department_id_dec,
        sub_department_id_no: this.sub_department_id_no,
        sub_department_id_dec: this.sub_department_id_dec,
        priority_id_no: this.priority_id_no,
        priority_id_dec: this.priority_id_dec,
        roll_id_no: this.roll_id_no,
        roll_id_desc: this.roll_id_desc,
        roll_time_multiplier: this.roll_time_multiplier,
        location_type_id: this.location_type_id,
        location_type_id_desc: this.location_type_id_desc,
        location_id: this.location_id,
        name_of_the_location: this.name_of_the_location,
        location_type_id2: this.location_type_id2,
        longitude: this.longitude,
        // altitude:this.altitude,
        latitude: this.latitude,
        under_location: this.under_location,
        gmt_different: this.gmt_different,
        problem_id_no: this.problem_id_no,
        problem_status: this.problem_status,
        problem_id_desc: this.problem_id_desc,
        escalation_hrs: this.escalation_hrs,
        problem_time: this.problem_time,
        priority_id_no2: this.priority_id_no2,
        user_id_no: this.user_id_no,
        user_first_name: this.user_first_name,
        user_last_name: this.user_last_name,
        user_username: this.user_username,
        user_id_desc: this.user_id_desc,
        user_mobile: this.user_mobile,
        user_email: this.user_email,
        user_mobile_privacy: this.user_mobile_privacy,
        user_roll_admin: this.user_roll_admin,
        user_roll_user: this.user_roll_user,
        user_roll_technician: this.user_roll_technician,
        user_status: this.user_status,
        roll_id_no2: this.roll_id_no2,
        notification_policy_code: this.notification_policy_code,
        notification_policy_code2: this.notification_policy_code2,
        notification_policy_name: this.notification_policy_name,
        notification_policy_time1: this.notification_policy_time1,
        notification_policy_reminder: this.notification_policy_reminder,
        escalation_code: this.escalation_code,
        escalation_code2: this.escalation_code2,
        escalation_level: this.escalation_level,
        comment_Header: this.comment_Header,
        comment_Suffix: this.comment_Suffix,
        comment_Prefix: this.comment_Prefix,
        comment: this.comment,

        escalation_reassignment: this.escalation_reassignment,
        from: this.from,
        to: this.to,
        shifts: this.shifts,
        user: this.user,
        problem_asset_mapping_problem: this.problem_asset_mapping_problem,
        problem_asset_mapping_asset_type_id: this.problem_asset_mapping_asset_type_id,
        clientId: this.clientId,
        vendor_id: this.vendor_id,
        vendor_name: this.vendor_name,
        vendor_description: this.vendor_description,
        vendor_email: this.vendor_email,
        vendor_phone: this.vendor_phone
        // user_notify_to:this.user_notify_to
      });

      // alert("this is schema");
      // alert($scope.model_id_no);
      // alert($scope.asset_type_id_no);
      // if($scope.asset_type_id_no==)
      source.clientId = Authentication.user.lastName;;
      source.asset_type_id_no = $scope.asset_type_id_no;
      source.asset_type_id_des = $scope.asset_type_id_des;
      source.authontiocation = Authentication.user._id;
      source.user = Authentication.user._id;
      source.mfg_id_no = $scope.mfg_id_no;
      source.mfg_id_des = $scope.mfg_id_des;
      source.model_id_no = $scope.model_id_no;
      source.model_id_des = $scope.model_id_des;
      // source.employee_id_dec=$scope.employee_id_dec;
      // source.employee_name=$scope.employee_name;
      // source.employee_mobile=$scope.employee_mobile;
      // source.employee_email=$scope.employee_email;
      // source.employee_id_no=$scope.employee_id_no;
      // alert(document.getElementById('longitude').value);
      // if($scope.latitude==undefined||$scope.latitude==null||$scope.latitude==""&&$scope.longitude==undefined||$scope.longitude==null||$scope.longitude==''){
      //   alert('inside if condition');
      //   console.log('inside if condition of location add');
      //   $scope.latitude=document.getElementById(latitude).value;
      //   $scope.longitude=document.getElementById(longitude).value;
      // }
      // alert($scope.under_location);
      source.department_id_dec = $scope.department_id_dec;
      source.department_id_no = $scope.department_id_no;
      source.sub_department_id_dec = $scope.sub_department_id_dec;
      source.sub_department_id_no = $scope.sub_department_id_no;
      source.priority_id_no = $scope.priority_id_no;
      source.problem_id_desc = $scope.priority_id_dec;
      source.roll_id_no = $scope.roll_id_no;
      source.roll_id_desc = $scope.roll_id_desc;
      source.roll_time_multiplier = $scope.roll_time_multiplier;
      source.location_type_id = $scope.location_type_id;
      source.location_type_id_desc = $scope.location_type_id_desc;
      source.location_id = $scope.location_id;
      source.name_of_the_location = $scope.name_of_the_location;
      source.location_type_id2 = $scope.location_type_id2;
      source.longitude = $scope.longitude;
      // source.altitude=$scope.altitude;
      source.latitude = $scope.latitude;
      // alert($scope.under_location)
      if ($scope.under_location == undefined) {
        // alert("inside under");
        // alert(undrloc)
        // $scope.under_location = undrloc;
        source.under_location = undrloc;

      } else {
        source.under_location = $scope.under_location;
      }
      source.gmt_different = $scope.gmt_different;
      source.problem_id_no = $scope.problem_id_no;
      source.problem_id_desc = $scope.problem_id_desc;
      source.problem_status = $scope.problem_status;
      source.escalation_hrs = $scope.escalation_hrs;
      source.problem_time = $scope.problem_time;
      source.comment = $scope.comment;
      source.comment_Header = $scope.comment_Header;
      source.comment_Prefix = $scope.comment_Prefix;
      source.comment_Suffix = $scope.comment_Suffix;
      if ($scope.priority_id_no2 === undefined) {
        // alert("inside if");
        source.priority_id_no2 = prioritytype;
      } else {
        source.priority_id_no2 = $scope.priority_id_no2;
      }
      source.roll_id_no2 = $scope.roll_id_no2;
      source.notification_policy_code = $scope.notification_policy_code,
        source.notification_policy_name = $scope.notification_policy_name,
        source.notification_policy_time1 = $scope.notification_policy_time1,
        source.notification_policy_reminder = $scope.notification_policy_reminder,
        source.escalation_code = $scope.escalation_code,
        source.escalation_code2 = $scope.escalation_code2,
        source.notification_policy_code2 = $scope.notification_policy_code2,
        source.escalation_level = $scope.escalation_level,
        source.escalation_reassignment = $scope.escalation_reassignment,
        source.from = $scope.from,
        source.to = $scope.to,
        source.shifts = $scope.shifts,
        source.problem_asset_mapping_asset_type_id = $scope.problem_asset_mapping_asset_type_id,
        source.problem_asset_mapping_problem = $scope.problem_asset_mapping_problem,
        source.vendor_name = $scope.vendor_name,
        source.vendor_id = $scope.vendor_id,
        source.vendor_email = $scope.vendor_email,
        source.vendor_phone = $scope.vendor_phone,
        source.vendor_description = $scope.vendor_description
      // alert($scope.employee_id_no);
      // alert($scope.mfg_id_no);
      if (typeof ($scope.user_username != undefined) || $scope.user_username != null || $scope.user_username != '' && typeof ($scope.user_id_desc !== undefined) || $scope.user_id_desc !== null || $scope.user_id_desc !== "" && typeof ($scope.user_first_name !== undefined) || $scope.user_first_name !== null || $scope.user_first_name !== "") {

        // alert($scope.user_username);
        // alert($scope.user_id_desc);
        // alert($scope.user_first_name);
        // alert(typeof($scope.user_username));
        // source.password=generatePassword(10);
        // alert("inside sign up");
        // var credentials=new Sources({});
        var credentials = new Sources({
          firstName: this.firstName,
          lastName: this.lastName,
          tag_id: this.tag_id,
          mobile: this.mobile,
          email: this.email,
          username: this.username,
          description: this.description,
          password: this.password,
          roles: this.roles,
          user: this.user,
          status: this.status
        });
        credentials.user = Authentication.user._id;
        credentials.clientId = Authentication.user.clientId;

        credentials.messageType = "adnewwUser";
        credentials.firstName = $scope.user_first_name;
        // credentials.firstName="Arun";
        // alert(credentials.firstName);
        credentials.lastName = $scope.user_last_name;
        // credentials.lastName="Kavale";
        // alert(credentials.lastName)
        credentials.mobile = $scope.user_mobile;
        // credentials.mobile=9766999425;
        // alert(credentials.mobile);
        credentials.email = $scope.user_email;
        // credentials.email="arun1231@gmail.com";
        // alert(credentials.email);
        credentials.username = $scope.user_username;
        credentials.status = $scope.user_status;

        if ($scope.user_roll_admin == true && $scope.user_roll_technician == true && $scope.user_roll_user == true) {
          credentials.roles = ["admin", "user", "technician"];
        } else if ($scope.user_roll_admin == true && $scope.user_roll_technician == true) {
          credentials.roles = ["admin", "technician"];
        } else if ($scope.user_roll_admin == true && $scope.user_roll_user == true) {
          credentials.roles = ["admin", "user"];
        } else if ($scope.user_roll_technician == true && $scope.user_roll_user == true) {
          credentials.roles = ["technician", "user"];
        } else if ($scope.user_roll_admin == true) {
          credentials.roles = ["admin"];
        } else if ($scope.user_roll_user == true) {
          credentials.roles = ["user"];
        } else if ($scope.user_roll_technician == true) {
          credentials.roles = ["technician"];
        }

        credentials.description = $scope.user_id_desc;
        credentials.password = generatePassword(10);

        credentials.$save(function (response) {
          // console.log("client controller redirect after save");
          // alert("saved user");
          source.user_id_no = $scope.user_id_no;
          source.user_first_name = $scope.user_first_name;
          source.user_last_name = $scope.user_last_name;
          source.user_username = $scope.user_username;
          source.user_id_desc = $scope.user_id_desc;
          source.user_mobile = $scope.user_mobile;
          source.user_email = $scope.user_email;
          source.user_mobile_privacy = $scope.user_mobile_privacy;
          source.user_roll_admin = $scope.user_roll_admin;
          source.user_roll_user = $scope.user_roll_user;
          source.user_roll_technician = $scope.user_roll_technician;
          source.user_reporting = $scope.user_reporting;
          // source.user_notify_to=$scope.user_notify_to;
          source.user_status = $scope.user_status;
          // $scope.create();

        }, function (errorResponse) {

          $scope.error = errorResponse.data.message;
          // alert(error);
        });


        // alert("Password is : \n"+source.password);
      }

      // alert($scope.user_reporting);
      // if($scope.employee_id_no==$scope.employee_reporting){
      //   alert("Employee Should not be same");
      //   $scope.clear();
      //   return;
      // // }
      // console.log("inside create function");
      // // alert($scope.mfg_id_no);[object Undefined]
      // alert($scope.asset_type_id_des);
      // // alert(typeof $scope.asset_type_id_no);

      // if( typeof $scope.asset_type_id_no !== 'undefined'){
      //   alert("asset id");
      //   flag=0;
      // }
      // else if($scope.model_id_no.length !== 0 || typeof $scope.model_id_no !== 'undefined'){
      //    flag=2;
      //   alert("model id");
      // }
      // else{
      //   alert("nothing");
      // }

      // alert($.type($scope.mfg_id_des));

      /**
       * 
       * Flag is setting for changing a data tables
       * 
       */
      if ($scope.asset_type_id_no !== undefined && $scope.asset_type_id_no !== null && $scope.asset_type_id_no !== "") {
        flag = 0;
      } else if ($scope.mfg_id_no !== undefined && $scope.mfg_id_no !== null && $scope.mfg_id_no !== "") {
        flag = 1;
      } else if ($scope.model_id_no !== undefined && $scope.model_id_no !== null && $scope.model_id_no !== "") {
        flag = 2;
      } else if ($scope.employee_name !== undefined && $scope.employee_name !== null && $scope.employee_name !== "") {
        flag = 3;
      } else if ($scope.department_id_no !== undefined && $scope.department_id_no !== null && $scope.department_id_no !== "") {
        flag = 4;
      } else if ($scope.sub_department_id_no !== undefined && $scope.sub_department_id_no !== null && $scope.sub_department_id_no !== "") {
        flag = 5;
      } else if ($scope.priority_id_no !== undefined && $scope.priority_id_no !== null && $scope.priority_id_no !== "") {
        flag = 6;
      } else if ($scope.roll_id_no !== undefined && $scope.roll_id_no !== null && $scope.roll_id_no !== "") {
        flag = 7;
      } else if ($scope.location_type_id !== undefined && $scope.location_type_id !== null && $scope.location_type_id !== "") {
        flag = 8;
      } else if ($scope.location_id !== undefined && $scope.location_id !== null && $scope.location_id !== "") {
        flag = 9;
      } else if ($scope.user_id_no !== undefined && $scope.user_id_no !== null && $scope.user_id_no !== "") {
        flag = 11;
      } else if ($scope.problem_id_no !== undefined && $scope.problem_id_desc !== null && $scope.problem_id_no !== "") {
        flag = 10;
      } else if ($scope.escalation_code !== undefined && $scope.escalation_code !== null && $scope.escalation_code !== "") {
        flag = 12;
      } else if ($scope.problem_asset_mapping_asset_type_id !== undefined && $scope.problem_asset_mapping_asset_type_id !== null && $scope.problem_asset_mapping_asset_type_id !== "") {
        flag = 13;
      } else if ($scope.notification_policy_code !== undefined && $scope.notification_policy_code !== null && $scope.notification_policy_code !== "") {
        flag = 14;
      } else if ($scope.from !== undefined && $scope.from !== null && $scope.from !== "") {
        flag = 15;
      } else if ($scope.vendor_id !== undefined && $scope.vendor_id !== null && $scope.vendor_id !== "") {
        flag = 20;
      }

      // alert("This is the Priority ID  "+String($scope.location_type_id2));

      // console.log("value is "+source);
      // for(var x in source){
      //     console.log(x[0]);
      // }
      // Redirect after save
      // alert(source.user_notify_to);
      source.$save(function (response) {
        // alert('inside save');
        console.log("client controller redirect after save");
        $scope.clear();
        // $location.path('sources/create');
        //console.log(source);
        // Clear form fields
        // $scope.sources =response;
        object = Sources.query();
        $scope.find();
        $scope.findAsset();
        //  $scope.sources =object;
        console.log("THis is object");
        //  if(object[0].length)
        // checkUser
        console.log("this is length");
        // console.log(object[0].length);



        console.log(object);
        console.log("inside find function");
        init();
        //  initSA();
        //  $scope.user=Authentication.user._id;  
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    function datatable_destroy() {
      // alert("destroy1");
      $('#example').dataTable().fnDestroy();
    }

    function datatable_destroy2() {
      // alert("destroy2");
      $('#example2').dataTable().fnDestroy();
    }
    // Remove existing Source
    $scope.remove = function (source) {
      console.log("client controller remove existing Source")
      if (source) {
        source.$remove();

        for (var i in $scope.sources) {
          if ($scope.sources[i] === source) {
            $scope.sources.splice(i, 1);
          }
        }
      } else {
        $scope.source.$remove(function () {
          $location.path('sources');
        });
      }
    };


    //SA Table

    $scope.findSA = function () {
      console.log("inside findSA Function");
      // alert("findSA");
      var data = new Sources();
      data.messageType = "SourceAdditionTable";
      data.user = Authentication.user._id;
      data.clientId = Authentication.user.lastName;

      data.$save(function (response) {
        console.log("inside SA");
        console.log(response);
        //  alert("find SA save");
        $scope.object2 = response; //2 finding
        object4 = response;
        // angular.copy(response.Data, $scope.object2);
        console.log("this is object 2");
        console.log(object2);
        // initSA();
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }


    /**
     * 
     * 
     * Update Source Addition Table
     * 
     */
    $scope.updateSourceAddtion = function (isValid) {

      var source_Additions_Update = new Sources({
        source_asset_id_no: this.source_asset_id_no,
        source_asset_type_id_no: this.source_asset_type_id_no,
        tag_id: this.tag_id,
        source_mfg_id_no: this.source_mfg_id_no,
        source_model_id_no: this.source_model_id_no,
        source_sub_department_id_no: this.source_sub_department_id_no,
        source_location_type_id: this.source_location_type_id,
        source_department_id_no: this.source_department_id_no,
        source_location_id: this.source_location_id,
        source_installation_date: this.source_installation_date,
        source_last_service: this.source_last_service,
        source_next_service: this.source_next_service,
        source_amc_expr: this.source_amc_expr,
        source_user_id_no: this.source_user_id_no,
        user: this.user,
        clientId: this.clientId,
        user_notify_to: this.user_notify_to,
        source_asset_type: this.source_asset_type,
        vendor_Company_id: this.vendor_Company_id
      });
      source_Additions_Update.user = Authentication.user._id;
      source_Additions_Update.messageType = "updateSourceAddition";
      source_Additions_Update.id = sourceAdditionUpdate_Id;
      source_Additions_Update.source_asset_id_no = $scope.source_asset_id_no;
      source_Additions_Update.source_asset_type_id_no = $scope.source_asset_type_id_no;
      source_Additions_Update.tag_id = $scope.tag_id;
      source_Additions_Update.source_mfg_id_no = $scope.source_mfg_id_no;
      source_Additions_Update.source_model_id_no = $scope.source_model_id_no;
      // alert($scope.source_model_id_no);
      source_Additions_Update.source_sub_department_id_no = $scope.source_sub_department_id_no;
      source_Additions_Update.source_location_type_id = $scope.source_location_type_id;
      source_Additions_Update.source_department_id_no = $scope.source_department_id_no;
      source_Additions_Update.source_location_id = $scope.source_location_id;
      source_Additions_Update.source_installation_date = $scope.source_installation_date;
      source_Additions_Update.source_last_service = $scope.source_last_service;
      source_Additions_Update.source_next_service = $scope.source_next_service;
      source_Additions_Update.source_amc_expr = $scope.source_amc_expr;
      source_Additions_Update.source_user_id_no = $scope.source_user_id_no;
      source_Additions_Update.clientId = Authentication.user.lastName;
      source_Additions_Update.user_notify_to = $scope.user_notify_to;
      source_Additions_Update.source_asset_type = $scope.source_asset_type;
      
      source_Additions_Update.vendor_Company_id = $scope.vendor_Company_id;
      console.log("inside Update Source Addition");
      console.log(source_Additions_Update);
      // alert("updateSourceAddtion");
      source_Additions_Update.$save(function (response) {
        console.log("inside Updating SourceAddition");
        console.log(response);
        $scope.clearSA();
        // $scope.object2=response;//3 update
        //  alert("updateSourceAddtion save");
        $scope.findSA();
        datatable_destroy2();
        // $( document ).ready(function() {
        initSA();
        // clearSourceAddition();
        // $scope.clearSA();    // });    
        // initSA();
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // $scope.find
    }



    $scope.sourcAssetDelete = function (id) {

      // $scope.updateSA(id);
      var object3=new Object();
      var ticketflag = 0;
      var deleteFlag=0;
      var assetId;
      // sourceAdditionUpdate_Id = id;
      // console.log("inside FIndTwo Function");
      // var data2 = new Sources();
      // $scope.selectedAsset = object3.source_asset_type_id_no;
      // // alert(table);
      // data2.messageType = "SourceAdditionUpdate";
      // data2.source_Additions_Update
      // data2.tableId = id;
      // // console.log(table);
      // data2.$save(function (response) {
      // console.log("***** inside Source Asset Delete **** \n\n");
        
      //   object3=response;
      //   console.log(object2.Data);

      
      // });

        console.log($scope.object2.Data);
      
        for(var i=0;i<$scope.object2.Data.length;i++){
          if(id===$scope.object2.Data[i]._id){
             assetId=$scope.object2.Data[i].source_asset_id_no;
          }
        }

        for (var i = 0; i < ticketObject.Data.length; i++) {
          alert("inside for loop");
          if (ticketObject.Data[i].asset.id == assetId && ticketObject.Data[i].status == "open") {
            ticketflag = 1;
            // alert("you can not delete this asset because its used in ticket");
            deleteFlag=2;
            
            break;
          }
          else{
            ticketflag = 2;
            deleteFlag=1;
          }
        }
      if(ticketflag==2){
         $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to delete the Source Asset ?",
        text: "You will not be able to recover this Source Asset!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Deleted!',
        text: 'Your Source Asset has been deleted.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Source Asset  is safe',
        type: 'error'
      }

      $scope.checkCancel = function () {
        console.log("check cancel");
        alert("inside cancel");
        ticketflag = 3;
            deleteFlag=3;
      }

      $scope.checkConfirm = function () {
        // alert("inside delete conform");
        // alert(deleteFlag);
        // alert(ticketflag);
        if(deleteFlag==1){
          var source_Additions_Update = new Sources({

          });
          // source_Additions_Update.user=Authentication.user._id;
          source_Additions_Update.messageType = "deleteSourceAddition";
          source_Additions_Update.id = id;
          source_Additions_Update.$save(function (response) {
            console.log("inside Updating SourceAddition");
            console.log(response);
            $scope.clearSA();
            // $scope.object2=response;//3 update
            //  alert("updateSourceAddtion save");
            $scope.findSA();
            datatable_destroy2();
            // $( document ).ready(function() {
            initSA();
            // clearSourceAddition();
            // $scope.clearSA();    // });    
            // initSA();
          }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
          });
        }
        
       
      }
      }
      else if(ticketflag==1){
        // alert("you cannot delete this asset its used in ticket");

        $scope.sweet = {};
              $scope.sweet.option = {
                title: "You cannot delete this asset ?",
                text: "it's used in ticket",
                type: "error",
              }
              ticketflag=0;
              // exit();

      }

      // console.log($scope.object3);
      // alert('inside delete');

      // for(var i=0;i<ticketObject.length;i++)
      // {
      //   if(ticketObject[])
      // }
      
      // if(ticketflag==1){
      //  
      // }
      // else if(ticketflag==2){


     

     
      
      // $scope.find
    }



    $scope.clearAst = function () {
      $scope.asset_type_id_no = '';
      $scope.asset_type_id_des = '';
      $scope.UpdatAssetForm.$setPristine();

    }



    /**
     * 
     * Update Asset Data #########
     * 
     */


    $scope.assetDelete = function (index) {
      // alert("inside asset delete");
      // var disableUser=confirm("Are you sure you want to delete selected Asset ?");
      // if(disableUser){
      // alert(ticketObject.Data[0]._id);
      var ticketflag = 0,
        deleteConform = 0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].asset.id == object[0].asset_type_id_no[index] && ticketObject.Data[i].status == "open") {
          ticketflag = 1;
          $scope.sweet = {};
          $scope.sweet.option = {
            title: "You cannot delete this asset  ?",
            text: "it's used in ticket",
            type: "error",
          }
          alert("you can not delete this asset because its used in ticket");
          break;
        }
      }
      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this asset  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 0;
        if (ticketflag == 0) {
          assetDataTable();
        }
        // deleteConform = 0;
        return false;
      } else {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].asset_type_id_no[index] + " ?",
          text: "You will not be able to recover this  Asset!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your Asset has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your Asset  is safe',
          type: 'error'
        }

        // alert($scope.sweet.cancel.title);
        $scope.checkCancel = function () {
          // alert("inside cancle");
          deleteConform = 1;
          return false;
          // console.log("check cancel")
        }

        $scope.checkConfirm = function () {
          // console.log("check confrim")
          if (deleteConform == 0) {
            var source_Asset_Update = new Sources({
              asset_type_id_no: $scope.asset_type_id_no,
              asset_type_id_des: $scope.asset_type_id_des
            });
            // alert(user);
            source_Asset_Update.user = Authentication.user._id;
            source_Asset_Update.clientId = Authentication.user.lastName;

            // alert(Authentication.user._id);
            source_Asset_Update.index = index;
            // source_Asset_Update.id=object[0]._id;
            // source_Asset_Update.oldAssetType=object[0].asset_type_id_no[assetIndex];
            source_Asset_Update.messageType = "deleteAssetData";
            // source_Asset_Update.asset_type_id_des=$scope.asset_type_id_des;
            // source_Asset_Update.asset_type_id_no=$scope.asset_type_id_no;
            source_Asset_Update.id = object[0]._id;
            // alert("inside asset update "+assetIndex);
            source_Asset_Update.$save(function (response) {
              console.log("inside Updating Asset Id");
              // object=response;
              object = Sources.query();
              init();
              flag = 0;
              assetDataTable();
              $scope.clear();

              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }



    $scope.updateAsset = function () {

      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the Asset Data ? ",
        text: "You will not be able to recover this Asset Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Asset data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Asset data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel")
      }
      $scope.checkConfirm = function () {
        // $scope.sweet.confirm = {
        //     title: 'Deleted!',
        //     text: 'Your Manufacture has been deleted.',
        //     type: 'success'
        // };

        // $scope.sweet.cancel = {
        //     title: 'Cancelled!',
        //     text: 'Your Manufacture is safe',
        //     type: 'error'
        // }

        // $scope.checkCancel=function(){
        // console.log("check cancel")
        // }

        //  $scope.checkConfirm=function(){
        var source_Asset_Update = new Sources({
          asset_type_id_no: $scope.asset_type_id_no,
          asset_type_id_des: $scope.asset_type_id_des
        });
        // alert(user);
        source_Asset_Update.user = Authentication.user._id;
        source_Asset_Update.clientId = Authentication.user.lastName;

        // alert(Authentication.user._id);
        source_Asset_Update.index = assetIndex;
        // source_Asset_Update.id=object[0]._id;
        source_Asset_Update.oldAssetType = object[0].asset_type_id_no[assetIndex];
        source_Asset_Update.messageType = "updateAssetData";
        source_Asset_Update.asset_type_id_des = $scope.asset_type_id_des;
        source_Asset_Update.asset_type_id_no = $scope.asset_type_id_no;
        source_Asset_Update.id = object[0]._id;
        // alert("inside asset update "+assetIndex);
        source_Asset_Update.$save(function (response) {
          console.log("inside Updating Asset Id");
          // object=response;
          object = Sources.query();
          init();
          flag = 0;
          assetDataTable();
          $scope.clear();

          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      // $scope.clear();


      closePopup();
    }


    $scope.updateVendor = function () {
      alert("inside update");
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the Vendor Data ? ",
        text: "You will not be able to recover this Vendor Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Vendor data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Asset data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel")
      }
      $scope.checkConfirm = function () {
        // $scope.sweet.confirm = {
        //     title: 'Deleted!',
        //     text: 'Your Manufacture has been deleted.',
        //     type: 'success'
        // };

        // $scope.sweet.cancel = {
        //     title: 'Cancelled!',
        //     text: 'Your Manufacture is safe',
        //     type: 'error'
        // }

        // $scope.checkCancel=function(){
        // console.log("check cancel")
        // }

        //  $scope.checkConfirm=function(){
        var vendor = new Sources({});
        alert("");
        vendor.user = Authentication.user._id;
        vendor.clientId = Authentication.user.lastName;

        // alert(Authentication.user._id);
        vendor.index = vendorIndex;
        // source_Asset_Update.id=object[0]._id;
        // vendor.vendor_id=object[0].asset_type_id_no[assetIndex];
        vendor.messageType = "updateVendorData";
        vendor.vendor_id = $scope.vendor_id;
        vendor.vendor_description = $scope.vendor_description;
        vendor.vendor_name = $scope.vendor_name;
        vendor.vendor_phone = $scope.vendor_phone;
        vendor.vendor_email = $scope.vendor_email;
        vendor.id = object[0]._id;
        // alert("inside asset update "+assetIndex);
        vendor.$save(function (response) {
          console.log("inside Updating Asset Id");
          // object=response;
          object = Sources.query();
          init();
          flag = 20;
          // assetDataTable();
          $scope.clear();
          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      // $scope.clear();


      closePopup15();
    }


    /**
     * 
     * Update Manufacture Data  ############
     * 
     */

    $scope.manufactureDelete = function (index) {
      // var disableUser=confirm("Are you sure you want to delete selected Manufacture ?");
      // if(disableUser){
      var ticketflag = 0,
        deleteConform = 0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].manufactur.id == object[0].mfg_id_no[index] && ticketObject.Data[i].status == "open") {
          ticketflag = 1;
        }
      }
      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this Manufacture  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 0;

      } else {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].mfg_id_no[index] + " ?",
          text: "You will not be able to recover this  Manufacture!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your Manufacture has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your Manufacture is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel");
          deleteConform = 1;
          return false;
        }

        $scope.checkConfirm = function () {
          // console.log("check confrim")
          if (deleteConform == 0) {
            var source_Manufacture_Update = new Sources({});
            source_Manufacture_Update.user = Authentication.user._id;
            source_Manufacture_Update.clientId = Authentication.user.lastName;
            source_Manufacture_Update.index = index;
            source_Manufacture_Update.messageType = "deleteManufactureData";
            source_Manufacture_Update.id = object[0]._id;
            source_Manufacture_Update.$save(function (response) {
              console.log("inside Manufacture Delete");
              object = Sources.query();
              init();
              flag = 1;
              deleteConform = 1;
              manufactureTable();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }



    $scope.updateManufacture = function () {
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the Manufacture Data ? ",
        text: "You will not be able to recover this Manufacture Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Manufacture data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Manufacture data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel");
        return false;
      }
      $scope.checkConfirm = function () {
        var source_Manufacture_Update = new Sources({});
        source_Manufacture_Update.user = Authentication.user._id;
        source_Manufacture_Update.index = manufactureIndex;
        source_Manufacture_Update.id = object[0]._id;
        source_Manufacture_Update.messageType = "updateManufactureData";
        source_Manufacture_Update.mfg_id_des = $scope.mfg_id_des;
        source_Manufacture_Update.mfg_id_no = $scope.mfg_id_no;
        source_Manufacture_Update.clientId = Authentication.user.lastName;
        source_Manufacture_Update.$save(function (response) {
          console.log("inside Updating manufacture Id");
          object = Sources.query();
          flag = 1;
          init();
          manufactureTable();
          $scope.clear();
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      closePopup2();
    }




    /**
     * 
     * Update Escalation Data  ############
     * 
     */


    // $scope.updateEscalation=function(){
    //   alert("inside Escalation update");
    //   var source_Escalation_Update = new Sources({
    //   });
    //   // alert(user);
    //   source_Escalation_Update.user=Authentication.user._id;
    //   source_Escalation_Update.index=escalationIndex;
    //   source_Escalation_Update.id=object[0]._id;
    //   // source_Manufacture_Update.oldAssetType=object[0].asset_type_id_no[assetIndex];
    //   source_Escalation_Update.messageType="updateEscalationData";
    //   source_Escalation_Update.escalation_code=$scope.escalation_code;
    //   source_Escalation_Update.escalation_level=$scope.escalation_level;
    //   source_Escalation_Update.escalation_reassignment=$scope.escalation_reassignment;

    //   source_Escalation_Update.clientId=Authentication.user.lastName;
    //   // alert("inside asset update "+manufactureIndex);
    //   source_Escalation_Update.$save(function (response) {
    //     alert("inside Updating manufacture Id");
    //     object=Sources.query();
    //     flag=12;
    //     init();
    //     escalationTable();
    //     // object=response;
    //     $scope.clear();

    //     console.log(response);
    //   }, function (errorResponse) {
    //       $scope.error = errorResponse.data.message;
    //   });
    //   // $scope.clear();

    //   closePopup16();
    // }





    /**
     * 
     * Update Asset mapping Data  ############
     * 
     */


    $scope.updateAssetMapping = function () {
      // alert("inside Asseet Mapping update");
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the Asset Mapping Data ? ",
        text: "You will not be able to recover this Asset Mapping Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Asset Mapping data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Asset Mapping data is safe',
        type: 'error'
      }


      $scope.checkCancel = function () {
        console.log("check cancel");
        return false;
      }
      $scope.checkConfirm = function () {
        var source_Escalation_Update = new Sources({});
        // alert(user);
        alert(prblmAstID);
        alert(astMpngPrblmId);
        source_Escalation_Update.user = Authentication.user._id;
        source_Escalation_Update.index = assetMappingIndex;
        source_Escalation_Update.id = object[0]._id;
        var checkAssetMpng;


        if ($scope.problem_asset_mapping_asset_type_id == "" || $scope.problem_asset_mapping_asset_type_id == null || $scope.problem_asset_mapping_asset_type_id == undefined && $scope.problem_asset_mapping_problem != "") {
          $scope.problem_asset_mapping_asset_type_id = prblmAstID;
        } else if ($scope.problem_asset_mapping_asset_type_id != "" && $scope.problem_asset_mapping_problem == "" || $scope.problem_asset_mapping_problem == null || $scope.problem_asset_mapping_problem == undefined) {
          $scope.problem_asset_mapping_problem = astMpngPrblmId;
        }
        // source_Manufacture_Update.oldAssetType=object[0].asset_type_id_no[assetIndex];
        source_Escalation_Update.messageType = "updateAssetMappingData";
        source_Escalation_Update.problem_asset_mapping_asset_type_id = $scope.problem_asset_mapping_asset_type_id;
        source_Escalation_Update.problem_asset_mapping_problem = $scope.problem_asset_mapping_problem;
        // source_Escalation_Update.escalation_reassignment=$scope.escalation_reassignment;

        source_Escalation_Update.clientId = Authentication.user.lastName;
        // alert("inside asset update "+manufactureIndex);
        source_Escalation_Update.$save(function (response) {
          // alert("inside Updating manufacture Id");
          object = Sources.query();
          flag = 13;
          init();
          problemAssetMapping();
          // object=response;
          $scope.clear();

          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      closePopup17();
      // $scope.clear();

    }


    $scope.assetMappingDelete = function (index) {

      // alert("inside delete");
      var deleteConform = 0;
      var ticketflag=0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
      // alert("inside For");
        
      // alert(ticketObject.Data[i].asset.id + "" +object[0].problem_asset_mapping_asset_type_id[index] + "  "+ticketObject.Data[i].status );
        if (ticketObject.Data[i].asset.id === object[0].problem_asset_mapping_asset_type_id[index] && ticketObject.Data[i].status == "open") {
          // alert("inside if");
          // alert("you can not delete this asset because its used in ticket");
          
          ticketflag = 1;
         deleteConform = 1;
          
          // $scope.sweet = {};
          // $scope.sweet.option = {
          //   title: "You cannot delete this asset Mapping ?",
          //   text: "it's used in ticket",
          //   type: "error",
          // }

       

          break;
        }
      }

      if(ticketflag===1){
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this Asset Mapping  ?",
          text: "it's used in ticket",
          type: "error",
        }
      }
      else{
        $scope.sweet = {};
        $scope.sweet.option = {
        title: "Are you sure want to delete the " + object[0].problem_asset_mapping_asset_type_id[index] + " ?",
        text: "You will not be able to recover this  Asset!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Deleted!',
        text: 'Your Asset has been deleted.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Asset is safe',
        type: 'error'
      }
      }
      

      $scope.checkCancel = function () {
        console.log("check cancel");
        deleteConform = 1;
        return false;
      }
      $scope.checkConfirm = function () {
        if (deleteConform == 0) {
          var source_assetMappingDelete = new Sources({});
          source_assetMappingDelete.user = Authentication.user._id;
          source_assetMappingDelete.clientId = Authentication.user.lastName;
          source_assetMappingDelete.index = index;
          source_assetMappingDelete.messageType = "assetMappingDeleteData";
          source_assetMappingDelete.id = object[0]._id;
          source_assetMappingDelete.$save(function (response) {
            console.log("inside Manufacture Delete");
            object = Sources.query();
            init();
            flag = 13;
            problemAssetMapping();
            $scope.clear();
            console.log(response);
          }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
          });
        }
      }
    }







    $scope.updateShift = function () {
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the Shift Data ? ",
        text: "You will not be able to recover this  Shift Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Shift data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Shift data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel")
      }
      $scope.checkConfirm = function () {
        // alert("inside Escalation update");
        var source_Shift_Update = new Sources({});
        // alert(user);
        source_Shift_Update.user = Authentication.user._id;
        source_Shift_Update.index = shiftIndex;
        source_Shift_Update.id = object[0]._id;
        // source_Manufacture_Update.oldAssetType=object[0].asset_type_id_no[assetIndex];
        source_Shift_Update.messageType = "updateShiftData";
        source_Shift_Update.to = $scope.to;
        source_Shift_Update.from = $scope.from;
        source_Shift_Update.shifts = $scope.shifts;

        source_Shift_Update.clientId = Authentication.user.lastName;
        // alert("inside asset update "+manufactureIndex);
        source_Shift_Update.$save(function (response) {
          // alert("inside Updating manufacture Id");
          object = Sources.query();
          flag = 15;
          init();
          shiftsTable();
          $scope.clear();

          // object=response;
          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      closePopup18();
      // $scope.clear();

    }




    $scope.shiftDelete = function (index) {
      var ticketflag = 0,
        deleteConform = 0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].shift == object[0].shifts[index] && ticketObject.Data[i].status == "open") {
          ticketflag = 1;
        }
      }
      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this Shift data  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 0;
        deleteConform = 1;
      } else {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].shifts[index] + " ?",
          text: "You will not be able to recover this  Shift!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your Shift has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your Shift  is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel");
          deleteConform = 1;
          return false;
        }

        $scope.checkConfirm = function () {
          if (deleteConform == 0) {
            var source_shiftDelete = new Sources({});
            source_shiftDelete.user = Authentication.user._id;
            source_shiftDelete.clientId = Authentication.user.lastName;
            source_shiftDelete.index = index;
            source_shiftDelete.messageType = "shiftDeleteData";
            source_shiftDelete.id = object[0]._id;
            source_shiftDelete.$save(function (response) {
              console.log("inside Manufacture Delete");
              object = Sources.query();
              init();
              flag = 15;
              shiftsTable();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }





    /**
     * 
     * Update Notification Data  ############
     * 
     */


    // $scope.updateNotification=function(){
    //   var source_Notification_Update = new Sources({
    //   });
    //   // alert(user);
    //   source_Notification_Update.user=Authentication.user._id;
    //   source_Notification_Update.index=notificationIndex;
    //   source_Notification_Update.id=object[0]._id;
    //   // source_Manufacture_Update.oldAssetType=object[0].asset_type_id_no[assetIndex];
    //   source_Notification_Update.messageType="updateNotificationData";
    //   source_Notification_Update.notification_policy_code=$scope.notification_policy_code;
    //   source_Notification_Update.notification_policy_name=$scope.notification_policy_name;

    //   source_Notification_Update.notification_policy_reminder=$scope.notification_policy_reminder;

    //   source_Notification_Update.notification_policy_time1=$scope.notification_policy_time1;
    //   source_Notification_Update.clientId=Authentication.user.lastName;
    //   // alert("inside asset update "+manufactureIndex);
    //   source_Notification_Update.$save(function (response) {
    //     console.log("inside Updating manufacture Id");
    //     object=Sources.query();
    //     flag=14;
    //     init();
    //     notificationTable();
    //     $scope.clear();

    //     // object=response;
    //     console.log(response);
    //   }, function (errorResponse) {
    //       $scope.error = errorResponse.data.message;
    //   });
    //   closePopup15();
    //   // $scope.clear();

    // }
    // // emailConfigure


    $scope.checkEmailconfigured = function () {
      // $scope.emailobject={};
      $(".openCreted").chosen({
        width: "100%"
      });
      $(".openAssignee").chosen({
        width: "100%"
      });
      $(".openReporting").chosen({
        width: "100%"
      });
      $(".openNotify").chosen({
        width: "100%"
      });

      // console.log(emailCheckedData);
      // alert(emailobject.EmailData[0].user_name);
      // alert( "document loaded" );
      $(document).ready(function () {
        $('#addemaildiv').hide();
        $('#addSMSTemplatediv').hide();
        $('#OpenTemplate').hide();
        $('#OpenTemplate1').hide();
        $('#openAssigneeTemp').hide();
        $('#openReportingTemp').hide();
        $('#openNotifyTemp').hide();
        
      });

      $('#addEmail').click(function () {
        $('#addemaildiv').show();
        $('#addEmail').hide();
        $('#emailSubmit').show();
        $('#updatemail').hide();
        $('#addSMSTemplatediv').hide();
        

        // alert("inside asset click "+flag);
      });

      $('#addTemplate').click(function () {
        // alert(emailobject.EmailData[0].port);
        $('#addSMSTemplatediv').show();
        $('#addemaildiv').hide();
        $('#addEmail').hide();
        
        $('#addTemplate').hide();
        $('#templateSubmit').show();
        $('#templateupdate').hide();

        // alert("inside asset click "+flag);
      });

      $('#open').click(function () {
        // alert(emailobject.EmailData[0].port);
        $('#OpenTemplate').show(200);
        $('#openAssigneeTemp').show(200);
        $('#openReportingTemp').show(200);
        $('#openNotifyTemp').show(200);
       

        // alert("inside asset click "+flag);
      });

      $('#editEmail').click(function () {
        // alert("clicked on add");
        $('#emailpanel').hide();
        $('#addemaildiv').show();
        $('#emailSubmit').hide();
        $('#updatemail').show();
        // $('#updatemail').show();

      });
      $('#emailSubmit').click(function () {
        alert("clicked on Submit");
        $('#emaillabl').text("Email Configured");
        $('#emaillabl2').text("SMS Configured");

        $('#emailpanel').show();
        $('#addemaildiv').hide();
      });


      $('#deleteEmail').click(function () {
        // alert("clicked on add");
        $('#emailpanel').hide();
        $('#addemaildiv').hide();
        $('#addEmail').show();

      });
      $('#updatemail').click(function () {
        // alert("clicked on add");
        $('#emailpanel').show();
        $('#addemaildiv').hide();
      });

    }



    $scope.checkSMS = function () {
      // alert("inside check");

      var checkSMSConfig = new Sources({});
      // alert(user);
      checkSMSConfig.user = Authentication.user._id;
      checkSMSConfig.clientId = Authentication.user.lastName;
      // checkEmailConfig.clientId=Authentication.user.lastName;
      // alert( checkEmailConfig.clientId);
      checkSMSConfig.messageType = "checkSMS";

      // alert("inside asset update "+manufactureIndex);
      checkSMSConfig.$save(function (response) {
        console.log("Check SMS config ");
        $scope.smsobject = response;
        console.log(response);
        var apiKEy = $scope.smsobject.smsData[0].sms_apikey;
        $scope.apiString = ""

        for (var i = 0; i < apiKEy.length - 3; i++) {
          $scope.apiString = $scope.apiString + "X";
        }
        $scope.APIkey = apiKEy.slice((apiKEy.length - 3), apiKEy.length);
        smsCheckedData = response;
        console.log(response);
        console.log(smsCheckedData);

      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      console.log("this is mails\n\n\n\n\n");
      console.log(smsCheckedData);


      var checkSMSConfig2 = new Sources({});
      // alert(user);
      checkSMSConfig2.user = Authentication.user._id;
      checkSMSConfig2.clientId = Authentication.user.lastName;
      // checkEmailConfig.clientId=Authentication.user.lastName;
      // alert( checkEmailConfig.clientId);
      checkSMSConfig2.messageType = "checkTicketDetail";

      // alert("inside asset update "+manufactureIndex);
      checkSMSConfig2.$save(function (response) {
        console.log("Check sms template config ");
        $scope.ticketDetailobject = response;
        console.log(response);
        
        console.log(response);
        // console.log(smsCheckedData);

      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // console.log("this is mails\n\n\n\n\n");
      // console.log(smsCheckedData);



    }



    $scope.checkMails = function () {
      // alert("inside check");

      var checkEmailConfig = new Sources({});
      // alert(user);
      checkEmailConfig.user = Authentication.user._id;
      checkEmailConfig.clientId = Authentication.user.lastName;
      // checkEmailConfig.clientId=Authentication.user.lastName;
      // alert( checkEmailConfig.clientId);
      checkEmailConfig.messageType = "checkEmails";

      // alert("inside asset update "+manufactureIndex);
      checkEmailConfig.$save(function (response) {
        console.log("Check mail config ");
        $scope.emailobject = response;
        emailCheckedData = response;
        console.log(response);
        console.log(emailCheckedData);

      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      console.log("this is mails\n\n\n\n\n");
      console.log(emailCheckedData);
    }

    /**
     * 
     * Email Configuration
     * 
     */
    $scope.emailConfigure = function () {
      // var emailConfiguration = new Sources({
      // });

      var emailConfiguration = new Sources({
        delivery_method: this.delivery_method,
        address: this.address,
        port: this.port,
        domain: this.domain,
        user_name: this.user_name,
        password: this.password,
        user: this.user,
        clientId: this.clientId
      });
      emailConfiguration.user = Authentication.user._id;
      emailConfiguration.delivery_method = $scope.delivery_method;
      // alert($scope.delivery_method);
      // alert($scope.port);
      // alert($scope.user_name);
      emailConfiguration.port = $scope.port;
      emailConfiguration.address = $scope.address;

      emailConfiguration.domain = $scope.domain;
      emailConfiguration.user_name = $scope.user_name;
      emailConfiguration.password = $scope.password;
      emailConfiguration.messageType = "AddEmailConfiguration";
      emailConfiguration.clientId = Authentication.user.lastName;
      // alert("inside Source Add");
      // alert($scope.source_model_id_no);
      console.log(emailConfiguration);
      emailConfiguration.$save(function (response) {
        // alert("saved");
        var checkEmailConfig = new Sources({});
        // alert(user);
        checkEmailConfig.clientId = Authentication.user.lastName;

        checkEmailConfig.user = Authentication.user._id;
        checkEmailConfig.messageType = "checkEmails";

        // alert("inside asset update "+manufactureIndex);
        checkEmailConfig.$save(function (response) {
          console.log("Check mail config ");
          $scope.emailobject = response;
          console.log("\n\n");
          console.log($scope.emailobject);
          console.log(response);

        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });


        //  clearEmailConfg();
        $scope.checkEmailconfigured();
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }

    /**
     * 
     * Email Configuration
     * 
     */
    $scope.smsConfigure = function () {
      // var emailConfiguration = new Sources({
      // });
      // alert("inside SMS Add");
      var smsConfiguration = new Sources({
        sms_apikey: this.sms_apikey,
        sms_sender: this.sms_sender,
        sms_username: this.sms_username,
        sms_password: this.sms_password,
        /* user_name:this.user_name,
        password:this.password,*/
        user: this.user,
        clientId: this.clientId
      });
      smsConfiguration.user = Authentication.user._id;
      smsConfiguration.sms_apikey = $scope.sms_apikey;
      // alert($scope.delivery_method);
      // alert($scope.port);
      // alert($scope.user_name);
      smsConfiguration.sms_sender = $scope.sms_sender;
      smsConfiguration.sms_username = $scope.sms_username;

      smsConfiguration.sms_password = $scope.sms_password;
      // smsConfiguration.user_name=$scope.user_name;
      // smsConfiguration.sms_password=$scope.password;
      smsConfiguration.messageType = "AddSMSConfiguration";
      smsConfiguration.clientId = Authentication.user.lastName + "sms";
      // alert("inside Source Add");
      // alert($scope.source_model_id_no);
      // console.log(emailConfiguration);
      smsConfiguration.$save(function (response) {
        // alert("saved");
        var checkEmailConfig = new Sources({});
        // alert(user);
        checkEmailConfig.user = Authentication.user._id;
        checkEmailConfig.messageType = "checkSMS";

        checkEmailConfig.clientId = Authentication.user.lastName;
        // alert("inside asset update "+manufactureIndex);
        checkEmailConfig.$save(function (response) {
          console.log("Check mail config ");
          $scope.smsobject = response;

          var apiKEy = $scope.smsobject.smsData[0].sms_apikey;
          $scope.apiString = ""

          for (var i = 0; i < apiKEy.length - 3; i++) {
            $scope.apiString = $scope.apiString + "X";
          }
          $scope.APIkey = apiKEy.slice((apiKEy.length - 3), apiKEy.length)
          console.log(response);

        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
        //  clearEmailConfg();
        $scope.checkEmailconfigured();
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      clearSMSConfg();
    }



    $scope.deleteMail = function () {
      // alert("inside delet");

      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to delete configured mail data?",
        text: "You will not be able to recover this  mail data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Deleted!',
        text: 'Your mail has been deleted.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your mail  is safe',
        type: 'error'
      }

      $scope.checkCancel = function () {
        console.log("check cancel");
        $('#emailpanel').show();
      }
      $scope.checkConfirm = function () {
        $("#addEmail").show();

        var checkEmailConfig = new Sources({});
        // alert(user);
        checkEmailConfig.user = Authentication.user._id;
        checkEmailConfig.clientId = Authentication.user.lastName;

        checkEmailConfig.messageType = "deleteEmails";

        // alert("inside asset update "+manufactureIndex);
        checkEmailConfig.$save(function (response) {
          console.log("Check mail config ");
          clearEmailConfg();
          clearSMSConfg()
          var checkEmailConfig = new Sources({});
          // alert('user');
          checkEmailConfig.user = Authentication.user._id;
          checkEmailConfig.clientId = Authentication.user.lastName;

          checkEmailConfig.messageType = "checkEmails";

          // alert("inside asset update "+manufactureIndex);
          checkEmailConfig.$save(function (response) {
            console.log("Check mail config ");
            $scope.emailobject = response;
            console.log(response);
          }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
          });



        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    }



    $scope.deleteSMS = function () {
      // alert("inside delet");


      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to delete configured SMS data?",
        text: "You will not be able to recover this  SMS data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Deleted!',
        text: 'Your SMS has been deleted.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your SMS  is safe',
        type: 'error'
      }

      $scope.checkCancel = function () {
        console.log("check cancel");
        $('#emailpanel').show();
      }
      $scope.checkConfirm = function () {
        $("#addEmail").show();
        var checksmsConfig = new Sources({});
        checksmsConfig.user = Authentication.user._id;
        checksmsConfig.clientId = Authentication.user.lastName;
        checksmsConfig.messageType = "deleteSMS";
        checksmsConfig.$save(function (response) {
            console.log("Check mail config ");
            clearEmailConfg();
            clearSMSConfg()
            var checkSMSConfig = new Sources({});
            checkSMSConfig.user = Authentication.user._id;
            checkSMSConfig.clientId = Authentication.user.lastName;
            checkSMSConfig.messageType = "checkSMS";
            checkSMSConfig.$save(function (response) {
                console.log("Check SMS config ");
                $scope.smsobject = response;
                smsCheckedData = response;
                console.log(response);
                console.log(smsCheckedData);
              },
              function (errorResponse) {
                $scope.error = errorResponse.data.message;
              });
          },
          function (errorResponse) {
            $scope.error = errorResponse.data.message;
          });
      }
      // else{
      //   // $("deleteEmail").click
      //   $('#emailpanel').show();

      // }
    }




    function clearEmailConfg() {
      // alert("inside clear mail");
      $scope.delivery_method = '';
      $scope.port = "";
      $scope.domain = '';
      $scope.user_name = '';
      $scope.password = '';
      $scope.address = '';
    }

    function clearSMSConfg() {
      // alert("inside clear mail");
      $scope.sms_apikey = '';
      $scope.sms_sender = "";
      $scope.sms_username = '';
      $scope.sms_password = '';
      // $scope.password='';
      // $scope.address='';
    }

    $scope.updateEmail = function () {
      $scope.sweet = {};
      $scope.sweet.option = {
        title: 'Updated!',
        text: 'Your Email has been updated.',
        type: 'success'
      }
      var emailConfiguration = new Sources({

      });
      emailConfiguration.user = Authentication.user._id;
      emailConfiguration.delivery_method = $scope.delivery_method;
      // alert($scope.delivery_method);
      // alert($scope.port);
      // alert($scope.user_name);
      emailConfiguration.port = $scope.port;
      emailConfiguration.address = $scope.address;

      emailConfiguration.domain = $scope.domain;
      emailConfiguration.user_name = $scope.user_name;
      emailConfiguration.password = $scope.password;
      emailConfiguration.messageType = "UpdateEmailConfiguration";
      emailConfiguration.clientId = Authentication.user.lastName;
      // alert("inside Source Add");
      // alert($scope.source_model_id_no);
      console.log(emailConfiguration);
      emailConfiguration.$save(function (response) {

        var checkEmailConfig = new Sources({});
        // alert(user);
        checkEmailConfig.user = Authentication.user._id;
        checkEmailConfig.messageType = "checkEmails";
        checkEmailConfig.clientId = Authentication.user.lastName;

        // alert("inside asset update "+manufactureIndex);
        checkEmailConfig.$save(function (response) {
          console.log("Check mail config ");
          $scope.emailobject = response;
          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
        // alert("saved");
        clearEmailConfg();
        //  $scope.checkEmailconfigured();
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    }



    $scope.updateSMS = function () {

      var smsConfiguration = new Sources({

      });
      smsConfiguration.user = Authentication.user._id;
      smsConfiguration.sms_apikey = $scope.sms_apikey;
      // alert($scope.delivery_method);
      // alert($scope.port);
      // alert($scope.user_name);
      smsConfiguration.sms_sender = $scope.sms_sender;
      smsConfiguration.sms_username = $scope.sms_username;

      smsConfiguration.sms_password = $scope.sms_password;
      // smsConfiguration.user_name=$scope.user_name;
      // smsConfiguration.password=$scope.password;
      smsConfiguration.messageType = "UpdateSMSConfiguration";
      smsConfiguration.clientId = Authentication.user.lastName;
      // alert("inside Source Add");
      // alert($scope.source_model_id_no);
      console.log(smsConfiguration);
      smsConfiguration.$save(function (response) {

        var checkSMSConfig = new Sources({});
        // alert(user);
        checkSMSConfig.user = Authentication.user._id;
        checkSMSConfig.clientId = Authentication.user.lastName;
        // checkEmailConfig.clientId=Authentication.user.lastName;
        // alert( checkEmailConfig.clientId);
        checkSMSConfig.messageType = "checkSMS";
        checkSMSConfig.clientId = Authentication.user.lastName;

        // alert("inside asset update "+manufactureIndex);
        checkSMSConfig.$save(function (response) {
          console.log("Check SMS config ");
          $scope.smsobject = response;

          var apiKEy = $scope.smsobject.smsData[0].sms_apikey;
          $scope.apiString = ""

          for (var i = 0; i < apiKEy.length - 3; i++) {
            $scope.apiString = $scope.apiString + "X";
          }
          $scope.APIkey = apiKEy.slice((apiKEy.length - 3), apiKEy.length)
          smsCheckedData = response;
          console.log(response);
          console.log(smsCheckedData);

        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
        // alert("saved");
        clearEmailConfg();
        //  $scope.checkEmailconfigured();
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    }


    $scope.vendorDelete = function (index) {
      // 

      var ticketflag = 0,
        deleteConform = 0;
      // for(var i=0;i<ticketObject.Data.length;i++){
      //   if(ticketObject.Data[i].model==object[0].model_id_no[index]&&ticketObject.Data[i].status=="open"){
      //    ticketflag=1;
      //   }
      // }
      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this Model  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 0;
        // return false;

      } else {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].vendor_id[index] + " ?",
          text: "You will not be able to recover this Vendor!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your vendor has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your vendor is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel");
          deleteConform = 1;
          return false;
        }

        $scope.checkConfirm = function () {
          if (deleteConform == 0) {
            var source_vendorDelete = new Sources({});
            source_vendorDelete.user = Authentication.user._id;
            source_vendorDelete.clientId = Authentication.user.lastName;
            source_vendorDelete.index = index;
            source_vendorDelete.messageType = "vendorDeleteData";
            source_vendorDelete.id = object[0]._id;
            source_vendorDelete.$save(function (response) {
              console.log("inside Problem Delete");
              object = Sources.query();
              init();
              flag = 20;
              vendorTable();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }



    $scope.modelDelete = function (index) {
      // alert("inside model delete");
      var ticketflag = 0,
        deleteConform = 0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].model.id == object[0].model_id_no[index] && ticketObject.Data[i].status == "open") {
          ticketflag = 1;
          deleteConform=1;
        }
        // break;
      }
      if (ticketflag == 1) {
      // alert("inside ticket");
        
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this Model  ?",
          text: "it's used in ticket",
          type: "error",
        }
        // ticketflag = 0;
      } else {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].model_id_no[index] + " ?",
          text: "You will not be able to recover this Model!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your Model has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your Model  is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel");
          deleteConform = 1;
          return false;
        }
        $scope.checkConfirm = function () {
      alert("inside conform");
      alert(deleteConform);
      
          
          if (deleteConform == 0) {
      alert("inside delete");
            alert(deleteConform);
            var source_modelDelete = new Sources({});
            source_modelDelete.user = Authentication.user._id;
            source_modelDelete.clientId = Authentication.user.lastName;
            source_modelDelete.index = index;
            source_modelDelete.messageType = "modelDeleteData";
            source_modelDelete.id = object[0]._id;
            source_modelDelete.$save(function (response) {
              console.log("inside Problem Delete");
              object = Sources.query();
              init();
              flag = 2;
              modelTable();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }


    /* update Model Data */

    $scope.updateModel = function () {
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the Model Data ? ",
        text: "You will not be able to recover this  Model Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Model data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Model data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel");
        return false;
      }
      $scope.checkConfirm = function () {
        var source_Model_Update = new Sources({});
        // alert(user);
        source_Model_Update.user = Authentication.user._id;
        source_Model_Update.index = modelIndex;
        source_Model_Update.id = object[0]._id;
        // source_Manufacture_Update.oldAssetType=object[0].asset_type_id_no[assetIndex];
        source_Model_Update.messageType = "updateModelData";
        source_Model_Update.model_id_no = $scope.model_id_no;
        source_Model_Update.model_id_des = $scope.model_id_des;
        source_Model_Update.clientId = Authentication.user.lastName;
        // alert("inside model update "+modelIndex);
        source_Model_Update.$save(function (response) {
          console.log("inside Updating Model Id");
          object = Sources.query();
          init();
          flag = 2;
          modelTable();
          $scope.clear();

          // object=response;
          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      closePopup3();
      // $scope.clear();

    }

    $scope.findEmail = function () {
      alert("inside find email");
    }

    // $scope.updateEmployee=function(){
    //   var source_Employee_Update = new Sources({

    //   });
    //   alert(user);
    //   source_Employee_Update.user=Authentication.user._id;
    //   source_Employee_Update.index=employeeIndex;
    //   source_Employee_Update.id=object[0]._id;
    //   source_Employee_Update.oldAssetType=object[0].employee_name[employeeIndex];
    //   source_Employee_Update.messageType="updateEmployeeData";
    //   alert($scope.employee_name);

    //   if($scope.employee_reporting==undefined||$scope.employee_reporting==null||$scope.employee_reporting=="")
    //   {
    //     $scope.employee_reporting=emprpt;
    //   }
    //   else{
    //     $scope.employee_reporting=$scope.employee_reporting;
    //   }


    //   // source_Employee_Update.employee_id_no=$scope.employee_id_no;
    //   source_Employee_Update.employee_name=$scope.employee_name;
    //   source_Employee_Update.employee_id_dec=$scope.employee_id_dec;
    //   source_Employee_Update.employee_mobile=$scope.employee_mobile;
    //   source_Employee_Update.employee_email=$scope.employee_email;
    //   source_Employee_Update.employee_reporting=$scope.employee_reporting;
    //   source_Employee_Update.clientId=Authentication.user.lastName;
    //   // alert("inside Employee update "+employeeIndex);
    //   source_Employee_Update.$save(function (response) {
    //     console.log("inside Updating Employee Id");
    //     object=Sources.query();
    //     init();
    //     flag=3;
    //     employeeTable();
    //     // object=response;
    //     console.log(response);
    //   }, function (errorResponse) {
    //       $scope.error = errorResponse.data.message;
    //   });
    //   closePopup4();
    // }


    $scope.updateDepartment = function () {
      $scope.sweet = {};

      $scope.sweet.option = {
        title: "Are you sure want to edit the Department Data ? ",
        text: "You will not be able to recover this  Department Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Department data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Department data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel");
        return false;
      }
      $scope.checkConfirm = function () {
        var source_Department_Update = new Sources({

        });
        // alert(user);
        source_Department_Update.user = Authentication.user._id;
        source_Department_Update.index = deptIndex;
        source_Department_Update.id = object[0]._id;
        source_Department_Update.oldAssetType = object[0].department_id_no[deptIndex];
        source_Department_Update.messageType = "updateDepartmentData";
        source_Department_Update.department_id_no = $scope.department_id_no;
        source_Department_Update.department_id_dec = $scope.department_id_dec;
        source_Department_Update.clientId = Authentication.user.lastName;
        // alert("inside Employee update "+deptIndex);
        source_Department_Update.$save(function (response) {
          console.log("inside Updating Employee Id");
          // object=response;
          object = Sources.query();
          init();
          flag = 4;
          departmentTable();
          $scope.clear();
          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      closePopup5();
    }



    $scope.departmentDelete = function (index) {

      var ticketflag = 0,
        deleteConform = 0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].department.id == object[0].department_id_no[index] && ticketObject.Data[i].status == "open" || ticketObject.Data[i].status == "inprogress") {
          ticketflag = 1;
        }
      }
      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this Department data  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 0;
        // return false;
      } else if (ticketflag == 0) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].department_id_no[index] + " ?",
          text: "You will not be able to recover this  Department!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your Department has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your Department  is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel");
          deleteConform = 1;
          return false;
        }

        $scope.checkConfirm = function () {
          // var disableUser=confirm("Are you sure you want to delete selected department ?");
          // if(disableUser){
          if (deleteConform == 0) {
            var source_modelDelete = new Sources({});
            source_modelDelete.user = Authentication.user._id;
            source_modelDelete.clientId = Authentication.user.lastName;
            source_modelDelete.index = index;
            source_modelDelete.messageType = "departmentDeleteData";
            source_modelDelete.id = object[0]._id;
            source_modelDelete.$save(function (response) {
              console.log("inside Problem Delete");
              object = Sources.query();
              init();
              flag = 4;
              departmentTable();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }


    $scope.subDepartmentDelete = function (index) {
      var ticketflag = 0,
        deleteConform = 0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].subdepartment.id == object[0].sub_department_id_no[index] && ticketObject.Data[i].status == "open" || ticketObject.Data[i].status == "inprogress") {
          ticketflag = 1;
        }
      }

      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this Sub Department data  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 0;
        // return false;

      } else {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].sub_department_id_no[index] + " ?",
          text: "You will not be able to recover this  Sub Department!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your Sub Department has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your Sub Department  is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel");
          deleteConform = 1;
          return false;
        }

        $scope.checkConfirm = function () {
          if (deleteConform == 0) {
            var source_subDepartmentDelete = new Sources({});
            source_subDepartmentDelete.user = Authentication.user._id;
            source_subDepartmentDelete.clientId = Authentication.user.lastName;
            source_subDepartmentDelete.index = index;
            source_subDepartmentDelete.messageType = "subDepartmentDeleteData";
            source_subDepartmentDelete.id = object[0]._id;
            source_subDepartmentDelete.$save(function (response) {
              console.log("inside Manufacture Delete");
              object = Sources.query();
              init();
              flag = 5;
              subDepartmentTable();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }



    $scope.updateSubDepartment = function () {
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the Sub Department Data ? ",
        text: "You will not be able to recover this  Sub Department Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Sub Department data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Sub Department data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel")
      }
      $scope.checkConfirm = function () {
        var source_SubDepartment_Update = new Sources({

        });
        // alert(user);
        source_SubDepartment_Update.user = Authentication.user._id;
        source_SubDepartment_Update.index = sDeptIndex;
        source_SubDepartment_Update.id = object[0]._id;
        source_SubDepartment_Update.oldAssetType = object[0].sub_department_id_no[sDeptIndex];
        source_SubDepartment_Update.messageType = "updateSubDepartmentData";
        source_SubDepartment_Update.sub_department_id_no = $scope.sub_department_id_no;
        source_SubDepartment_Update.sub_department_id_dec = $scope.sub_department_id_dec;
        source_SubDepartment_Update.clientId = Authentication.user.lastName;
        // alert("inside Sub Department update "+sDeptIndex);
        source_SubDepartment_Update.$save(function (response) {
          console.log("inside Updating Sub department Id");
          // object=response;
          object = Sources.query();
          init();
          flag = 5;
          subDepartmentTable();
          $scope.clear();

          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      closePopup6();
      // $scope.clear();

    }




    $scope.priorityDelete = function (index) {

      var ticketflag = 0,
        deleteConform = 0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].priority.id == object[0].priority_id_no[index] && ticketObject.Data[i].status == "open" || ticketObject.Data[i].status == "inprogress") {
          ticketflag = 1;
        }
      }
      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this priority data  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 0;
      } else {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].priority_id_no[index] + " ?",
          text: "You will not be able to recover this  Priority!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your Priority has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your Piority is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel");
          deleteConform = 1;
          return false;
        }

        $scope.checkConfirm = function () {
          if (deleteConform == 0) {
            var source_priorityDelete = new Sources({});
            source_priorityDelete.user = Authentication.user._id;
            source_priorityDelete.clientId = Authentication.user.lastName;
            source_priorityDelete.index = index;
            source_priorityDelete.messageType = "priorityDeleteData";
            source_priorityDelete.id = object[0]._id;
            source_priorityDelete.$save(function (response) {
              console.log("inside Manufacture Delete");
              object = Sources.query();
              init();
              flag = 6;
              priorityTable();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }


    $scope.updatePriority = function () {
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the Priority Data ? ",
        text: "You will not be able to recover this  Priority Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Priority data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Priority data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel");
        return false;
      }
      $scope.checkConfirm = function () {
        var source_priority_Update = new Sources({});
        // alert(user);
        source_priority_Update.user = Authentication.user._id;
        source_priority_Update.index = priorityIndex;
        source_priority_Update.id = object[0]._id;
        // source_priority_Update.oldAssetType=object[0].sub_department_id_no[sDeptIndex];
        source_priority_Update.messageType = "updatePriorityData";
        source_priority_Update.priority_id_no = $scope.priority_id_no;
        source_priority_Update.priority_id_dec = $scope.priority_id_dec;
        source_priority_Update.clientId = Authentication.user.lastName;
        // alert("inside Priority update "+priorityIndex);
        source_priority_Update.$save(function (response) {
          console.log("inside Updating Priority Id");
          // object=response;
          object = Sources.query();
          init();
          flag = 6;
          priorityTable();
          $scope.clear();

          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      closePopup7();
    }






    $scope.rollDelete = function (index) {
      var ticketflag = 0,
        deleteConform = 0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].roll.id == object[0].roll_id_no[index] && ticketObject.Data[i].status == "open" || ticketObject.Data[i].status == "inprogress") {
          ticketflag = 1;
        }
      }
      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this role data  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 0;
      } else {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].roll_id_no[index] + " ?",
          text: "You will not be able to recover this  Role!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your role has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your role  is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel");
          deleteConform = 1;
          return false;
        }

        $scope.checkConfirm = function () {
          // var disableUser=confirm("Are you sure you want to delete selected Roll ?");
          // if(disableUser){
          if (deleteConform == 0) {
            var source_rollDelete = new Sources({});
            source_rollDelete.user = Authentication.user._id;
            source_rollDelete.clientId = Authentication.user.lastName;
            source_rollDelete.index = index;
            source_rollDelete.messageType = "rollDeleteData";
            source_rollDelete.id = object[0]._id;
            source_rollDelete.$save(function (response) {
              console.log("inside Manufacture Delete");
              object = Sources.query();
              init();
              flag = 7;
              rollTable();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }



    $scope.updateRollId = function () {
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the Role Data ? ",
        text: "You will not be able to recover this  Role Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Role data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Role data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel")
      }
      $scope.checkConfirm = function () {
        var source_Roll_Update = new Sources({

        });
        // alert(user);
        source_Roll_Update.user = Authentication.user._id;
        source_Roll_Update.index = rollIndex;
        source_Roll_Update.id = object[0]._id;
        // source_priority_Update.oldAssetType=object[0].sub_department_id_no[sDeptIndex];
        source_Roll_Update.messageType = "updateRollData";
        source_Roll_Update.roll_id_no = $scope.roll_id_no;
        source_Roll_Update.roll_id_desc = $scope.roll_id_desc;
        source_Roll_Update.roll_time_multiplier = $scope.roll_time_multiplier;
        source_Roll_Update.clientId = Authentication.user.lastName;
        // alert("inside Priority update "+rollIndex);
        source_Roll_Update.$save(function (response) {
          console.log("inside Updating Priority Id");
          // object=response;
          object = Sources.query();
          init();
          flag = 7;
          rollTable();
          $scope.clear();

          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      closePopup8();
      // $scope.clear();

    }




    $scope.locationTypeDelete = function (index) {

      var ticketflag = 0,
        deleteConform = 0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].locationtype.id == object[0].location_type_id[index] && ticketObject.Data[i].status == "open" || ticketObject.Data[i].status == "inprogress") {
          ticketflag = 1;
        }
      }
      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this Location type  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 0;
      } else {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].location_type_id[index] + " ?",
          text: "You will not be able to recover this  Location type!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your Location type has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your Location Type  is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel");
          deleteConform = 1;
          return false;
        }

        $scope.checkConfirm = function () {
          // var disableUser=confirm("Are you sure you want to delete selected Location Type ?");
          // if(disableUser){
          if (deleteConform == 0) {
            var source_locationTypeDelete = new Sources({});
            source_locationTypeDelete.user = Authentication.user._id;
            source_locationTypeDelete.clientId = Authentication.user.lastName;
            source_locationTypeDelete.index = index;
            source_locationTypeDelete.messageType = "locationTypeDeleteData";
            source_locationTypeDelete.id = object[0]._id;
            source_locationTypeDelete.$save(function (response) {
              console.log("inside Manufacture Delete");
              object = Sources.query();
              init();
              flag = 8;
              locationTable();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }

    $scope.updateLocationType = function () {
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the Location type Data ? ",
        text: "You will not be able to recover this  Location type Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Location type data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Location type data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel")
      }
      $scope.checkConfirm = function () {
        var source_LocationType_Update = new Sources({

        });
        // alert(user);
        source_LocationType_Update.user = Authentication.user._id;
        source_LocationType_Update.index = locTyIndex;
        source_LocationType_Update.id = object[0]._id;
        // source_priority_Update.oldAssetType=object[0].sub_department_id_no[sDeptIndex];
        source_LocationType_Update.messageType = "updateLocationTypeData";
        source_LocationType_Update.location_type_id = $scope.location_type_id;
        source_LocationType_Update.location_type_id_desc = $scope.location_type_id_desc;
        source_LocationType_Update.clientId = Authentication.user.lastName;
        // alert("inside Priority update "+locTyIndex);
        source_LocationType_Update.$save(function (response) {
          console.log("inside Updating Priority Id");
          // object=response;
          object = Sources.query();
          init();
          flag = 8;
          locationTable();
          $scope.clear();

          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      closePopup9();
      // $scope.clear();

    }





    $scope.locationDelete = function (index) {

      var ticketflag = 0,
        deleteConform = 0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].location.id == object[0].location_id[index] && ticketObject.Data[i].status == "open" || ticketObject.Data[i].status == "inprogress") {
          ticketflag = 1;
        }
      }
      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this location data  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 0;
        return false;
      } else {

        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].location_id[index] + " ?",
          text: "You will not be able to recover this Location!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your Location has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your Location  is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel")
          deleteConform = 1;
          return false;
        }

        $scope.checkConfirm = function () {
          if (deleteConform == 0) {
            var source_locationDelete = new Sources({});
            source_locationDelete.user = Authentication.user._id;
            source_locationDelete.clientId = Authentication.user.lastName;
            source_locationDelete.index = index;
            source_locationDelete.messageType = "locationDeleteData";
            source_locationDelete.id = object[0]._id;
            source_locationDelete.$save(function (response) {
              console.log("inside Location Delete");
              object = Sources.query();
              init();
              flag = 9;
              location2table();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }

    $scope.updateLocation = function () {
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the Location Data ? ",
        text: "You will not be able to recover this  Location Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your Location data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your Location data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel")
      }
      $scope.checkConfirm = function () {
        var source_Location_Update = new Sources({

        });
        // alert(user);
        source_Location_Update.user = Authentication.user._id;
        source_Location_Update.index = locIndex;
        source_Location_Update.id = object[0]._id;
        // source_priority_Update.oldAssetType=object[0].sub_department_id_no[sDeptIndex];
        source_Location_Update.messageType = "updateLocationData";
        source_Location_Update.location_id = $scope.location_id;
        source_Location_Update.name_of_the_location = $scope.name_of_the_location;
        source_Location_Update.location_type_id2 = $scope.location_type_id2;
        source_Location_Update.longitude = $scope.longitude;
        source_Location_Update.latitude = $scope.latitude;
        // source_Location_Update.altitude=$scope.altitude;
        source_Location_Update.gmt_different = $scope.gmt_different;
        if ($scope.location_type_id2 == undefined || $scope.location_type_id2 == null || $scope.location_type_id2 == "") {
          $scope.location_type_id2 = loctype;
        } else {
          $scope.location_type_id2 = $scope.location_type_id2;
        }

        if ($scope.under_location == undefined || $scope.under_location == null || $scope.under_location == "") {
          $scope.under_location = undrloc;
        } else {
          $scope.under_location = $scope.under_location;
        }

        source_Location_Update.under_location = $scope.under_location;

        source_Location_Update.clientId = Authentication.user.lastName;
        // alert("inside Location update "+locIndex);
        source_Location_Update.$save(function (response) {
          console.log("inside Updating Location Id");
          // object=response;
          object = Sources.query();
          init();
          flag = 9;
          location2table();
          $scope.clear();

          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      closePopup10();
      // $scope.clear();
    }





    $scope.problemDelete = function (index) {
      alert("inside problem delete ");

      var ticketflag = 0,
        deleteConform = 1;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].problem.id == object[0].problem_id_no[index] && ticketObject.Data[i].status == "open" || ticketObject.Data[i].status == "inprogress") {
          ticketflag = 1;
          alert("inside problem if delete ");
          break;
        }
      }
      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this Problem data  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 2;
        deleteConform=0;
      } else {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].problem_id_no[index] + " ?",
          text: "You will not be able to recover this  Problem!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your Problem has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your Problem  is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel");
          deleteConform = 1;
          return false;
        }

        $scope.checkConfirm = function () {
          alert("inside conform");

          // if (deleteConform == 2) {
            var source_problemDelete = new Sources({});
            source_problemDelete.user = Authentication.user._id;
            source_problemDelete.clientId = Authentication.user.lastName;
            source_problemDelete.index = index;
            source_problemDelete.messageType = "problemDeleteData";
            source_problemDelete.id = object[0]._id;
            source_problemDelete.$save(function (response) {
              console.log("inside Problem Delete");
              object = Sources.query();
              init();
              flag = 10;
              problemtable();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          // }
        }
      }
    }


    $scope.updateProblem = function () {
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit the problem data ",
        text: "You will not be able to recover this  problem Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your problem data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your problem data is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel")
        // closePopup12();

      }

      $scope.checkConfirm = function () {
        var source_Employee_Update = new Sources({

        });
        // alert(user);
        source_Employee_Update.user = Authentication.user._id;
        source_Employee_Update.index = problemIndex;
        source_Employee_Update.id = object[0]._id;
        source_Employee_Update.oldAssetType = object[0].problem_id_no[employeeIndex];
        source_Employee_Update.messageType = "updateProblemData";
        source_Employee_Update.problem_id_no = $scope.problem_id_no;
        source_Employee_Update.problem_id_desc = $scope.problem_id_desc;
        source_Employee_Update.escalation_hrs = $scope.escalation_hrs;
        source_Employee_Update.problem_time = $scope.problem_time;
        if ($scope.problem_status == '' || $scope.problem_status == null) {
          // alert('inside if');
          source_Employee_Update.problem_status = prblmstatus;
        } else {
          source_Employee_Update.problem_status = $scope.problem_status;

        }

        // alert($scope.problem_time);



        if ($scope.priority_id_no2 == undefined || $scope.priority_id_no2 == null || $scope.priority_id_no2 == "") {
          $scope.priority_id_no2 = prioritytype;
        } else {
          $scope.priority_id_no2 = $scope.priority_id_no2;
        }

        if ($scope.notification_policy_code2 == undefined || $scope.notification_policy_code2 == null || $scope.notification_policy_code2 == "") {
          $scope.notification_policy_code2 = ntfcode;
        } else {
          $scope.notification_policy_code2 = $scope.notification_policy_code2;
        }

        if ($scope.escalation_code2 == undefined || $scope.escalation_code2 == null || $scope.escalation_code2 == "") {
          $scope.escalation_code2 = esclcode;
        } else {
          $scope.escalation_code2 = $scope.escalation_code2;
        }
        source_Employee_Update.escalation_level = $scope.escalation_level;
        source_Employee_Update.notification_policy_reminder = $scope.notification_policy_reminder;
        source_Employee_Update.priority_id_no2 = $scope.priority_id_no2;
        source_Employee_Update.comment_Header = $scope.comment_Header;
        source_Employee_Update.comment_Suffix = $scope.comment_Suffix;
        source_Employee_Update.comment_Prefix = $scope.comment_Prefix;
        source_Employee_Update.comment = $scope.comment;

        // source_Employee_Update.priority_id_no2=$scope.priority_id_no2;
        source_Employee_Update.clientId = Authentication.user.lastName;
        // alert("inside Employee update "+problemIndex);
        source_Employee_Update.$save(function (response) {
          console.log("inside Updating Employee Id");
          // object=response;
          object = Sources.query();
          init();
          flag = 10;
          problemtable();
          $scope.clear();

          console.log(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      closePopup11();
      // $scope.clear();
    }







    $scope.userDelete = function (index) {
      findUser = object[0].user_username[index];

      var ticketflag = 0,
        deleteConform = 0;
      for (var i = 0; i < ticketObject.Data.length; i++) {
        if (ticketObject.Data[i].employee.id == object[0].user_id_no[index] && ticketObject.Data[i].status == "open" || ticketObject.Data[i].status == "inprogress") {
          ticketflag = 1;
        }
      }
      if (ticketflag == 1) {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "You cannot delete this user  ?",
          text: "it's used in ticket",
          type: "error",
        }
        ticketflag = 0;
      } else {
        $scope.sweet = {};
        $scope.sweet.option = {
          title: "Are you sure want to delete the " + object[0].user_id_no[index] + " ?",
          text: "You will not be able to recover this  User Data!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
        }
        $scope.sweet.confirm = {
          title: 'Deleted!',
          text: 'Your user has been deleted.',
          type: 'success'
        };

        $scope.sweet.cancel = {
          title: 'Cancelled!',
          text: 'Your user  is safe',
          type: 'error'
        }

        $scope.checkCancel = function () {
          console.log("check cancel");
          deleteConform = 1;
          return false;
        }

        $scope.checkConfirm = function () {
          if (deleteConform == 0) {
            var source_userDelete = new Sources({});
            source_userDelete.user = Authentication.user._id;
            source_userDelete.clientId = Authentication.user.lastName;
            source_userDelete.index = index;
            source_userDelete.messageType = "userDeleteData";
            source_userDelete.findUser = findUser;
            source_userDelete.id = object[0]._id;
            source_userDelete.$save(function (response) {
              console.log("inside Problem Delete");
              object = Sources.query();
              init();
              flag = 11;
              usertable();
              $scope.clear();
              console.log(response);
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }
        }
      }
    }



    $scope.updateUser = function () {
      $scope.sweet = {};
      $scope.sweet.option = {
        title: "Are you sure want to edit user data the ",
        text: "You will not be able to recover this  User Data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Edit it!",
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: false,
        closeOnCancel: false
      }
      $scope.sweet.confirm = {
        title: 'Updated!',
        text: 'Your user data has been updated.',
        type: 'success'
      };

      $scope.sweet.cancel = {
        title: 'Cancelled!',
        text: 'Your user is safe',
        type: 'error'
      }
      $scope.checkCancel = function () {
        console.log("check cancel")
        // closePopup12();
        return false;
      }

      $scope.checkConfirm = function () {
        var source_User_Update = new Sources({

        });
        // alert(user);
        source_User_Update.user = Authentication.user._id;
        source_User_Update.index = userIndex;
        source_User_Update.id = object[0]._id;
        source_User_Update.findUser = findUser;
        // source_User_Update.oldAssetType=object[0].user_id_no[employeeIndex];
        source_User_Update.messageType = "updateUserData";
        source_User_Update.user_id_no = $scope.user_id_no;
        source_User_Update.user_first_name = $scope.user_first_name;
        source_User_Update.user_last_name = $scope.user_last_name;
        source_User_Update.user_username = $scope.user_username;
        source_User_Update.user_id_desc = $scope.user_id_desc;
        source_User_Update.user_reporting = $scope.user_reporting;
        // alert($scope.user_reporting);

        source_User_Update.user_roll_admin = $scope.user_roll_admin;
        source_User_Update.user_roll_technician = $scope.user_roll_technician;
        source_User_Update.user_roll_user = $scope.user_roll_user;
        source_User_Update.user_mobile_privacy = $scope.user_mobile_privacy;
        source_User_Update.user_notify_to = $scope.user_notify_to;
        // alert($scope.user_mobile2);
        if ($scope.user_mobile == null) {
          alert("null");
        }
        // $scope.user_mobile=$scope.user_mobile;
        source_User_Update.user_mobile = Number($scope.user_mobile);
        source_User_Update.user_email = $scope.user_email;
        source_User_Update.user_status = $scope.user_status;


        if ($scope.roll_id_no2 == undefined || $scope.roll_id_no2 == null || $scope.roll_id_no2 == "") {
          $scope.roll_id_no2 = rollid;
        } else {
          $scope.roll_id_no2 = $scope.roll_id_no2;
        }
        // alert(rollid);
        // alert
        source_User_Update.roll_id_no2 = $scope.roll_id_no2;

        if ($scope.user_reporting == undefined || $scope.user_reporting == null || $scope.user_reporting == "") {
          $scope.user_reporting = userReprt;
        } else {
          $scope.user_reporting = $scope.user_reporting;
        }
        source_User_Update.user_reporting = $scope.user_reporting;



        source_User_Update.clientId = Authentication.user.lastName;
        // alert("inside Employee update "+userIndex);
        source_User_Update.$save(function (response) {

          console.log("inside Updating Employee Id");
          // object=response; 
          object = Sources.query();
          init();
          flag = 11;
          usertable();
          $scope.clear();

          // console.log(response);
          if (response.data === "Sorry user is no longer available") {

            alert(response.data);
          }
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
      // $scope.clear();
      closePopup12();
    }

    // Update existing Article

    $scope.updateSA = function (table) {
      // alert("SOURCE Addition Update");



      sourceAdditionUpdate_Id = table;
      console.log("inside FIndTwo Function");
      var data2 = new Sources();
      $scope.selectedAsset = object3.source_asset_type_id_no;
      // alert(table);
      data2.messageType = "SourceAdditionUpdate";
      data2.source_Additions_Update
      data2.tableId = table;
      console.log(table);
      data2.$save(function (response) {
        console.log("inside UpdateSA");
        console.log(response);

        mfgId = response.source_mfg_id_no;
        assetTID = response.source_asset_type_id_no;
        // alert(response.source_model_id_no);
        mdlID = response.source_model_id_no;
        empID = response.source_user_id_no;
        subDeptId = response.source_sub_department_id_no;
        deptID = response.source_department_id_no;
        locID = response.source_location_id;
        locTID = response.source_location_type_id;

        $(".ATID").val(response.source_asset_type_id_no).trigger("chosen:updated");
        $(".MFID").val(response.source_mfg_id_no).trigger("chosen:updated");
        // alert(response.source_model_id_no);
        userid = response.source_user_id_no;
        $(".MDID2").val(response.source_model_id_no).trigger("chosen:updated");
        $(".EMPID").val(response.source_user_id_no).trigger("chosen:updated");
        $(".SDID").val(response.source_sub_department_id_no).trigger("chosen:updated");
        $(".DPID").val(response.source_department_id_no).trigger("chosen:updated");
        $(".LTID").val(response.source_location_type_id).trigger("chosen:updated");
        $(".LCID").val(response.source_location_id).trigger("chosen:updated");
        $(".ASAST").val(response.source_asset_type).trigger("chosen:updated");
        notifyto = response.user_notify_to;
        asset_type = response.source_asset_type;
        vendorCompanyId = response.vendor_Company_id;
        $(".ntf").val(response.user_notify_to).trigger("chosen:updated");
        $(".chzn-selectvendor").val(response.vendor_Company_id).trigger("chosen:updated");





        // alert("inside update SA");
        // alert();
        console.log(response);
        $scope.object3 = response;
        my_val = response.source_mfg_id_no;
        // $(".chzn-select3").val(my_val).trigger("chosen:updated");

        // alert(my_val);
        console.log(object3.source_mfg_id_no);
        console.log(object3);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      })
    }


    $scope.updateSACopy = function (table) {
      // alert("SOURCE Addition Update");
      sourceAdditionUpdate_Id = table;
      console.log("inside FIndTwo Function");
      var data2 = new Sources();
      $scope.selectedAsset = object3.source_asset_type_id_no;
      // alert(table);
      data2.messageType = "SourceAdditionUpdate";
      data2.source_Additions_Update
      data2.tableId = table;
      console.log(table);
      data2.$save(function (response) {
        console.log("inside UpdateSA");
        console.log(response);

        mfgId = response.source_mfg_id_no;
        assetTID = response.source_asset_type_id_no;
        // alert(response.source_model_id_no);
        mdlID = response.source_model_id_no;
        empID = response.source_user_id_no;
        subDeptId = response.source_sub_department_id_no;
        deptID = response.source_department_id_no;
        locID = response.source_location_id;
        locTID = response.source_location_type_id;

        $(".ATID").val(response.source_asset_type_id_no).trigger("chosen:updated");
        $(".MFID").val(response.source_mfg_id_no).trigger("chosen:updated");
        // alert(response.source_model_id_no);
        userid = response.source_user_id_no;
        $(".MDID2").val(response.source_model_id_no).trigger("chosen:updated");
        $(".EMPID").val(response.source_user_id_no).trigger("chosen:updated");
        $(".SDID").val(response.source_sub_department_id_no).trigger("chosen:updated");
        $(".DPID").val(response.source_department_id_no).trigger("chosen:updated");
        $(".LTID").val(response.source_location_type_id).trigger("chosen:updated");
        $(".LCID").val(response.source_location_id).trigger("chosen:updated");
        $(".ASAST").val(response.source_asset_type).trigger("chosen:updated");
        notifyto = response.user_notify_to;
        asset_type = response.source_asset_type;
        vendorCompanyId = response.vendor_Company_id;
        $(".ntf").val(response.user_notify_to).trigger("chosen:updated");
        $(".chzn-selectvendor").val(response.vendor_Company_id).trigger("chosen:updated");





        // alert("inside update SA");
        // alert();
        console.log(response);
        $scope.object3 = response;
        my_val = response.source_mfg_id_no;
        // $(".chzn-select3").val(my_val).trigger("chosen:updated");

        // alert(my_val);
        console.log(object3.source_mfg_id_no);
        console.log(object3);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      })
    }
    // $scope.updateSA = function (table) {
    //   sourceAdditionUpdate_Id=table;
    //   console.log("inside FIndTwo Function");
    //   var data2=new Sources();
    //   $scope.selectedAsset=object3.source_asset_type_id_no;
    //   data2.messageType="SourceAdditionUpdate";
    //   data2.tableId=table;
    //   console.log(table);
    //   data2.$save(function (response) {
    //     console.log("inside UpdateSA");
    //     console.log(response);
    //     $scope.object3=response;
    //     console.log("");
    //     console.log(object3);
    //   }, function (errorResponse) {
    //     $scope.error = errorResponse.data.message;
    //   });
    // };

    // $scope.sourceAdditionUpdate=function(table){
    //   alert("SOURCE Addition Update");
    //   sourceAdditionUpdate_Id=table;
    //   console.log("inside FIndTwo Function");
    //   var data2=new Sources();
    //   $scope.selectedAsset=object3.source_asset_type_id_no;
    //   alert(table);
    //   data2.messageType="SourceAdditionUpdate";
    //   data2.tableId=table;
    //   console.log(table);
    //   data2.$save(function (response) {
    //     console.log("inside UpdateSA");
    //     console.log(response);
    //     $scope.object3=response;
    //     console.log("");
    //     console.log(object3);
    //   }, function (errorResponse) {
    //     $scope.error = errorResponse.data.message;
    //   });
    // }


    $scope.editMail = function () {
      var emailCheckedData;
      var checkEmailConfig = new Sources({});
      // alert("user");
      checkEmailConfig.user = Authentication.user._id;
      checkEmailConfig.clientId = Authentication.user.lastName;

      checkEmailConfig.messageType = "checkEmails";

      // alert("inside asset update "+manufactureIndex);
      checkEmailConfig.$save(function (response) {
        // console.log("Check mail config ");
        emailCheckedData = response;
        console.log("this is email checked");
        console.log(emailCheckedData);
        $scope.delivery_method = emailCheckedData.EmailData[0].delivery_method;
        $scope.address = emailCheckedData.EmailData[0].address;
        $scope.port = Number(emailCheckedData.EmailData[0].port);
        $scope.domain = emailCheckedData.EmailData[0].domain;
        $scope.user_name = emailCheckedData.EmailData[0].user_name;
        $scope.password = emailCheckedData.EmailData[0].password;


      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // emailCheckedData
    }



    $scope.editSMS = function () {
      var smsCheckedData;
      var checkSMSConfig = new Sources({});
      // alert("user");
      checkSMSConfig.user = Authentication.user._id;
      checkSMSConfig.clientId = Authentication.user.lastName;

      checkSMSConfig.messageType = "checkSMS";

      // alert("inside asset update "+manufactureIndex);
      checkSMSConfig.$save(function (response) {
        // console.log("Check mail config ");
        smsCheckedData = response;
        console.log("this is email checked");
        console.log(smsCheckedData);
        $scope.sms_apikey = smsCheckedData.smsData[0].sms_apikey;

        var apiKEy = $scope.sms_apikey;
        $scope.apiString = ""

        for (var i = 0; i < apiKEy.length - 3; i++) {
          $scope.apiString = $scope.apiString + "X";
        }
        $scope.APIkey = apiKEy.slice((apiKEy.length - 3), apiKEy.length)
        $scope.sms_sender = smsCheckedData.smsData[0].sms_sender;
        $scope.sms_username = smsCheckedData.smsData[0].sms_username;
        $scope.sms_password = smsCheckedData.smsData[0].sms_password;
        // $scope.user_name=smsCheckedData.EmailData[0].user_name;
        // $scope.password=smsCheckedData.EmailData[0].password;


      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // emailCheckedData
    }

    // Update existing Source
    $scope.update = function (assetid, assetDec, index) {
      console.log("client controller update existing source")
      //  alert("EditAsset  "+assetid);
      var source = object;
      console.log(source);
      console.log("asset id" + assetid);
      console.log("Asset dec " + assetDec);
      console.log("index " + index);
      console.log(object[0].asset_type_id_no[index]);
      console.log(object[0].asset_type_id_des[index]);
      console.log("this is object");
      console.log(object);
      //  if(object[0].asset_type_id_no[index]==assetid){
      console.log("inside update function");
      object[0].asset_type_id_no[index] = "new data updated Asset";
      object[0].asset_type_id_des[index] = "new Data updated des";
      console.log("new object");
      console.log(object);
      //  }
      object[0].$update(function () {}, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // $scope.error = null;

      // if (!isValid) {
      //   $scope.$broadcast('show-errors-check-validity', 'sourceForm');
      //   return false;
      // }
      var source = object[0];
      source.$update(function () {
        //   $location.path('sources/' + source._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };


    /**
     * 
     * Create new Souce
     * 
     */

    //  // Create new Source
    //  $scope.create = function (isValid) {

    //   console.log("client sources create controller")
    // $scope.error = null;

    // if (!isValid) {
    //   $scope.$broadcast('show-errors-check-validity', 'sourceForm');
    //   console.log("true...")
    //   return false;
    // }

    // // Create new Source object
    //     console.log("client controller create new source object")
    // var source = new Sources({
    //   asset_type_id_no: this.asset_type_id_no,
    //   asset_type_id_des: this.asset_type_id_des,
    //   mfg_id_no: this.mfg_id_no,
    //   mfg_id_des: this.mfg_id_des,
    //   model_id_no: this.model_id_no,
    //   model_id_des:  this.model_id_des,
    //   employee_id_no: this.employee_id_no,
    //   employee_id_dec: this.employee_id_dec,
    //   employee_mobile: this.employee_mobile,
    //   employee_email: this.employee_email,
    //   department_id_no: this.department_id_no,
    //   department_id_dec: this.department_id_dec,
    //   sub_department_id_no: this.sub_department_id_no,
    //   sub_department_id_dec: this.sub_department_id_dec,
    //   priority_id_no:this.priority_id_no,
    //   priority_id_dec: this.priority_id_dec,
    //   roll_id_no: this.roll_id_no,
    //   roll_id_desc: this.roll_id_desc,
    //   roll_time_multiplier:this.roll_time_multiplier,
    //   location_type_id: this.location_type_id,
    //   location_type_id_desc: this.location_type_id_desc,
    //   location_id: this.location_id,
    //   name_of_the_location: this.name_of_the_location,
    //   location_type_id2:this.location_type_id2,
    //   longitude:this.longitude,
    //   altitude:this.altitude,
    //   gmt_different:this.gmt_different,
    //   problem_id_no:this.problem_id_no,
    //   problem_id_desc:this.problem_id_desc,
    //   escalation_hrs:this.escalation_hrs,
    //   priority_id_no2:this.priority_id_no2,
    //   user_id_no:this.user_id_no,
    //   user_id_desc:this.user_id_desc,
    //   user_mobile:this.user_mobile,
    //   user_email:this.user_email,
    //   roll_id_no2:this.roll_id_no2,
    //   user:this.user


    // });



    // source.asset_type_id_no=$scope.asset_type_id_no;
    // source.asset_type_id_des=$scope.asset_type_id_des;
    // source.authontiocation=Authentication.user._id;
    // user=Authentication.user._id;
    // source.mfg_id_no=$scope.mfg_id_no;
    // source.mfg_id_des=$scope.mfg_id_des;
    // source.model_id_no=$scope.model_id_no;
    // source.model_id_des=$scope.model_id_des;
    // source.employee_id_dec=$scope.employee_id_dec;
    // source.employee_mobile=$scope.employee_mobile;
    // source.employee_email=$scope.employee_email;
    // source.employee_id_no=$scope.employee_id_no;
    // source.department_id_dec=$scope.department_id_dec;
    // source.department_id_no=$scope.department_id_no;
    // source.sub_department_id_dec=$scope.sub_department_id_dec;
    // source.sub_department_id_no=$scope.sub_department_id_no;
    // source.priority_id_no=$scope.priority_id_no;
    // source.problem_id_desc=$scope.priority_id_dec;
    // source.roll_id_no=$scope.roll_id_no;
    // source.roll_id_desc=$scope.roll_id_desc;
    // source.roll_time_multiplier=$scope.roll_time_multiplier;
    // source.location_type_id=$scope.location_type_id;
    // source.location_type_id_desc=$scope.location_type_id_desc;
    // source.location_id=$scope.location_id;
    // source.name_of_the_location=$scope.name_of_the_location;
    // source.location_type_id2=$scope.location_type_id2;
    // source.longitude=$scope.longitude;
    // source.altitude=$scope.altitude;
    // source.gmt_different=$scope.gmt_different;
    // source.problem_id_no=$scope.problem_id_no;
    // source.problem_id_desc=$scope.problem_id_desc;
    // source.escalation_hrs=$scope.escalation_hrs;
    // source.priority_id_no2=$scope.priority_id_no2;
    // source.user_id_no=$scope.user_id_no;
    // source.user_id_desc=$scope.user_id_desc;
    // source.user_mobile=$scope.user_mobile;
    // source.user_email=$scope.user_email;
    // source.roll_id_no2=$scope.roll_id_no2;

    // alert("This is the Priority ID  "+String($scope.location_type_id2));

    //   // console.log("value is "+source);
    //   // for(var x in source){
    //   //     console.log(x[0]);
    //   // }
    // // Redirect after save
    // source.$save(function (response) {
    //   console.log("client controller redirect after save");
    //  // $location.path('sources/create');
    //   //console.log(source);
    //   // Clear form fields
    //  // $scope.sources =response;


    //  object=Sources.query();
    //  $scope.sources =object;
    //  console.log("THis is object");
    //  console.log(object);
    //  console.log("inside find function");
    //  init();
    // //  $scope.user=Authentication.user._id;  
    // clearField();
    // $scope.clear();
    // }, function (errorResponse) {
    //   $scope.error = errorResponse.data.message;
    // });
    // };
    // $scope.find1 = function () {
    // datatable_destroy();
    //   //object=Sources.query();
    //   //var sourcesAd=Sources
    //   $scope.sources =object;
    //   mainObject=object;
    //   console.log("THis is object find1");
    //   console.log(object);
    //   console.log("inside find1 function");
    //   init();
    //   // initSA();
    //   $scope.user=Authentication.user._id;      
    //   // $scope.sources = Sources.query();
    // };






    // Find a list of Source
    $scope.find = function () {
      // datatable_destroy();
      Sources.user = Authentication.user._id;
      Sources.clientId = Authentication.user.lastName;

      object = Sources.query();
      var sourcesAd = Sources
      $scope.sources = object;
      // alert("find")
      // mainObject=object;
      console.log("THis is object");
      console.log("inside Find function");
      console.log(object);
      console.log("this is length");
      console.log(object.length);

      console.log("inside find function");
      init();
      // initSA();
      // $scope.sources = Sources.query();
    };


    $scope.findAsset = function () {
      console.log("inside FindAsset Function");
      // alert("FindAsset");
      // alert(Authentication.user._id);
      var data = new Sources();
      var sources2;
      data.messageType = "sourceAssetConfiguration";
      data.user = Authentication.user._id;
      data.clientId = Authentication.user.lastName;
      data.$save(function (response) {
        console.log("inside SC");
        console.log(response);
        // alert("find SC save");
        var objectSC = response;
        $scope.sources2 = response;
        console.log($scope.sources2.Data.length);
        if ($scope.sources2.Data.length != 0) {
          checkUser = "present";
        }
        console.log(sources2);
        console.log("this is object");
        console.log("inside find asset function");
        // object=objectSC.Data
        console.log(objectSC.Data);
        object = objectSC.Data;
        //2 finding
        // angular.copy(response.Data, $scope.object2);
        console.log("this is object");
        // console.log(object);
        initSA();
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }


    function clearFieldSA() {
      // alert("2nd clear");
      $scope.source_asset_id_no = '';
      $scope.source_asset_type_id_no = '';
      $scope.tag_id = '';
      $scope.source_mfg_id_no = '';
      $scope.source_model_id_no = '';
      $scope.source_employee_id_no = '';
      $scope.source_sub_department_id_no = '';
      $scope.source_department_id_no = '';
      $scope.source_location_id = '';
      $scope.source_location_type_id = '';
      $scope.source_installation_date = '';
      $scope.source_amc_expr = '';
      $scope.source_last_service = '';
      $scope.source_next_service = '';
      $scope.edit = true;
      $scope.sourceForm2.$setPristine();
      $scope.sourceForm2.$setUntouched();
      $scope.sourceAddForm.$setPristine();
      $scope.sourceAddForm.$setUntouched();
      $(".ATID").val('').trigger("chosen:updated");
      $(".MDID2").val('').trigger("chosen:updated");
      $(".SDID").val('').trigger("chosen:updated");
      $(".LTID").val('').trigger("chosen:updated");
      $(".ntf").val('').trigger("chosen:updated");
      $(".chzn-selectvendor").val('').trigger("chosen:updated");
      $(".MFID").val('').trigger("chosen:updated");
      $(".EMPID").val('').trigger("chosen:updated");
      $(".DPID").val('').trigger("chosen:updated");
      $(".LCID").val('').trigger("chosen:updated");

    }



    /* Clear All field */
    $scope.clear = function () {
      $scope.required = true;
      $scope.assetForm.$setPristine();
      $scope.assetForm.$setUntouched();
      $scope.addManufacturedForm.$setPristine();
      $scope.addManufacturedForm.$setUntouched();
      $scope.addModelForm.$setPristine();
      $scope.addModelForm.$setUntouched();
      $scope.addDepartmentForm.$setPristine();
      $scope.addDepartmentForm.$setUntouched();
      $scope.addsubDepartmentForm.$setPristine();
      $scope.addsubDepartmentForm.$setUntouched();
      $scope.addPriorityForm.$setPristine();
      $scope.addPriorityForm.$setUntouched();
      $scope.addRollForm.$setPristine();
      $scope.addRollForm.$setUntouched();
      $scope.addLocationTypeForm.$setPristine();
      $scope.addLocationTypeForm.$setUntouched();
      $scope.addLocationForm.$setPristine();
      $scope.addLocationForm.$setUntouched();
      $scope.addDepartmentForm.$setPristine();
      $scope.addDepartmentForm.$setUntouched();
      $scope.addUserForm.$setPristine();
      $scope.addUserForm.$setUntouched();
      $scope.addProblemForm.$setPristine();
      $scope.addProblemForm.$setUntouched();
      $scope.UpdatAssetForm.$setPristine();
      $scope.UpdatAssetForm.$setUntouched();
      $scope.UpdateLocationForm.$setPristine();
      $scope.UpdateLocationForm.$setUntouched();
      $scope.problemAssetMapping.$setPristine();
      $scope.problemAssetMapping.$setUntouched();
      $scope.addShiftForm.$setPristine();
      $scope.addShiftForm.$setUntouched();
      $scope.addVendorForm.$setPristine();
      $scope.addVendorForm.$setUntouched();
      $scope.updateShiftFrom.$setPristine();
      $scope.updateShiftFrom.$setUntouched();
      $scope.assetcheck = "";
      $scope.manufacturecheck = "";
      $scope.checkmodel = "";
      $scope.checkemployee = "";
      $scope.checkDept = "";
      $scope.subDeptcheck = "";
      $scope.checkPriority = "";
      $scope.checkRoll = "";
      $scope.checkLocType = "";
      $scope.checkLoc = "";
      $scope.checkPrblm = "";
      $scope.checkUser = "";
      $scope.asset_type_id_no = '';
      $scope.asset_type_id_des = '';
      $scope.mfg_id_no = '';
      $scope.mfg_id_des = '';
      $scope.model_id_no = '';
      $scope.model_id_des = '';
      $scope.employee_id_no = '';
      $scope.employee_id_dec = '';
      $scope.employee_mobile = '';
      $scope.employee_email = '';
      $scope.employee_name = '';
      $scope.employee_reporting = '';
      $scope.department_id_dec = '';
      $scope.department_id_no = '';
      $scope.sub_department_id_dec = '';
      $scope.sub_department_id_no = '';
      $scope.priority_id_no = '';
      $scope.priority_id_dec = '';
      $scope.roll_id_no = '';
      $scope.roll_id_desc = '';
      $scope.roll_time_multiplier = '';
      $scope.location_type_id = '';
      $scope.location_type_id_desc = '';
      $scope.location_id = "";
      $scope.name_of_the_location = '';
      $scope.location_type_id2 = '';
      $scope.longitude = '';
      $scope.latitude = '';
      $scope.under_location = '';
      $scope.gmt_different = '';
      $scope.problem_id_no = '';
      $scope.problem_id_desc = '';
      $scope.escalation_hrs = '';
      $scope.priority_id_no2 = '';
      $scope.notification_policy_code2 = '';
      $scope.escalation_code2 = '';
      $scope.problem_time = '';
      $scope.user_id_no = '';
      $scope.user_first_name = '';
      $scope.user_username = '';
      $scope.user_id_desc = '';
      $scope.user_mobile = '';
      $scope.user_email = '';
      $scope.roll_id_no2 = '';
      $scope.problem_asset_mapping_asset_type_id = '';
      $scope.problem_asset_mapping_problem = '';
      $scope.escalation_code = '';
      $scope.under_location = '';
      $scope.escalation_code2 = '';
      $scope.notification_policy_code2 = '';
      $scope.escalation_level = '';
      $scope.escalation_reassignment = '';
      $scope.notification_policy_code = '';
      $scope.notification_policy_name = '';
      $scope.notification_policy_reminder = '';
      $scope.notification_policy_time1 = '';
      $scope.to = '';
      $scope.from = '';
      $scope.shifts = '';
      $scope.user_roll_admin = false;
      $scope.user_roll_user = false;
      $scope.user_roll_technician = false;
      $scope.user_reporting = '';
      $scope.user_status = '';
      $scope.edit = true;
      $scope.comment_Header='';
      $scope.comment_Prefix='';
      $scope.comment_Suffix='';
      $(".reportingTo").val('').trigger("chosen:updated");
      $(".rollId").val('').trigger("chosen:updated");
      $(".ecllvl").val('').trigger("chosen:updated");
      $(".prtType").val('').trigger("chosen:updated");
      $(".prtTypet").val('').trigger("chosen:updated");
      $scope.vendor_id = '';
      $scope.vendor_name = '';
      $scope.vendor_email = '';
      $scope.vendor_phone = '';
      $scope.vendor_description = '';
      // alert("cleared all field");
    }


    $scope.clearSA = function () {
      // alert("Clear field");

      // clearFieldSA();
      $scope.source_asset_id_no = '';
      $scope.source_asset_type_id_no = '';
      $scope.tag_id = ' ';
      $scope.source_mfg_id_no = '';
      $scope.source_model_id_no = '';
      $scope.source_employee_id_no = '';
      $scope.source_sub_department_id_no = '';
      $scope.source_department_id_no = '';
      $scope.source_location_id = '';
      $scope.source_location_type_id = '';
      $scope.source_installation_date = '';
      $scope.source_amc_expr = '';
      $scope.source_last_service = '';
      $scope.source_next_service = '';
      $scope.edit = true;

      // $scope.sourceForm2.$setPristine();
      // $scope.sourceForm2.$setUntouched();
      // $scope.sourceAddForm.$setPristine();
      // $scope.sourceAddForm.$setUntouched();
      $(".chzn-select4").val('').trigger("chosen:updated");
      $(".chzn-selectvendor").val('').trigger("chosen:updated");
      $(".MDID2").val('').trigger("chosen:updated");
      $(".SDID").val('').trigger("chosen:updated");
      $(".LTID").val('').trigger("chosen:updated");

      $(".chzn-select3").val('').trigger("chosen:updated");
      // alert(response.source_model_id_no);
      $(".chzn-select5").val('').trigger("chosen:updated");
      $(".ntf").val('').trigger("chosen:updated");
      $(".ASAST").val('').trigger("chosen:updated");
      $(".ATID").val('').trigger("chosen:updated");
      $(".MDID2").val('').trigger("chosen:updated");
      $(".SDID").val('').trigger("chosen:updated");
      $(".LTID").val('').trigger("chosen:updated");
      $(".ntf").val('').trigger("chosen:updated");
      $(".chzn-selectvendor").val('').trigger("chosen:updated");
      $(".MFID").val('').trigger("chosen:updated");
      $(".EMPID").val('').trigger("chosen:updated");
      $(".DPID").val('').trigger("chosen:updated");
      $(".LCID").val('').trigger("chosen:updated");

      // sourceAddForm.$setPristine();
      // sourceAddForm.$setUntouched();


      // $(".EMPID").val('').trigger("chosen:updated");
      // $(".SDID").val('').trigger("chosen:updated");
      // $(".DPID").val('').trigger("chosen:updated");
      // $(".LTID").val('').trigger("chosen:updated");
      // $(".LCID").val('').trigger("chosen:updated");
      // alert("assets clered");
    }



    function generatePassword(passwordLength) {
      var numberChars = "0123456789";
      var upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var lowerChars = "abcdefghiklmnopqrstuvwxyz";
      var specialSymboll = '#$@';
      var allChars = numberChars + upperChars + lowerChars + specialSymboll;
      var randPasswordArray = Array(passwordLength);
      randPasswordArray[0] = numberChars;
      randPasswordArray[1] = upperChars;
      randPasswordArray[2] = lowerChars;
      randPasswordArray[3] = specialSymboll;
      randPasswordArray = randPasswordArray.fill(allChars, 4);
      return shuffleArray(randPasswordArray.map(function (x) {
        return x[Math.floor(Math.random() * x.length)]
      })).join('');
    }

    function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    }


    // Find existing Source
    $scope.findSAByID = function () {
      $scope.source = Sources.get({
        sourceId: $stateParams.sourceId
      });
    };


    // $scope.demo3 = function () {
    //   SweetAlert.swal({
    //           title: "Are you sure?",
    //           text: "Your will not be able to recover this imaginary file!",
    //           type: "warning",
    //           showCancelButton: true,
    //           confirmButtonColor: "#DD6B55",
    //           confirmButtonText: "Yes, delete it!",
    //           closeOnConfirm: false,
    //           closeOnCancel: false
    //       },
    //       function () {
    //           SweetAlert.swal("Ok!");
    //       });
    //     }
    $scope.editSay = function () {
      // alert("inside Angualr  Edit");
      document.getElementById("popup");
      console.log("Angular edit");
      console.log(mainObject);
    }

  }

]);

// app.controller('MainCtrl', function ($scope) {

// });
// // var app = angular.module("ngSweetAlert", ['ng-sweet-alert']);
// app.controller('MainCtrl', function ($scope) {
//    $scope.sweet = {};
//    $scope.sweet.option = {
//        title: "Are you sure?",
//        text: "You will not be able to recover this imaginary file!",
//        type: "warning",
//        showCancelButton: true,
//        confirmButtonColor: "#DD6B55",
//        confirmButtonText: "Yes, delete it!",
//        cancelButtonText: "No, cancel it!",
//        closeOnConfirm: false,
//        closeOnCancel: false
//    }
//    $scope.sweet.confirm = {
//        title: 'Deleted!', 
//        text: 'Your imaginary file has been deleted.',
//        type: 'success'
//    };

//    $scope.sweet.cancel = {
//        title: 'Cancelled!',
//        text: 'Your imaginary file is safe',
//        type: 'error'
//    }

//    $scope.checkCancel=function(){
//    console.log("check cancel")
//    }

//     $scope.checkConfirm=function(){
//      console.log("check confrim")
//    }

// });

'use strict';

//Sources service used for communicating with the Sources REST endpoints
angular.module('sources').factory('Sources', ['$resource',
  function ($resource) {
    return $resource('api/sources/:sourceId', {
      sourceId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

/**
 * jQuery Geocoding and Places Autocomplete Plugin - V 1.7.0
 *
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2016
 * @author Ubilabs http://ubilabs.net, 2016
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

// # $.geocomplete()
// ## jQuery Geocoding and Places Autocomplete Plugin
//
// * https://github.com/ubilabs/geocomplete/
// * by Martin Kleppe <kleppe@ubilabs.net>

(function($, window, document, undefined){

  // ## Options
  // The default options for this plugin.
  //
  // * `map` - Might be a selector, an jQuery object or a DOM element. Default is `false` which shows no map.
  // * `details` - The container that should be populated with data. Defaults to `false` which ignores the setting.
  // * 'detailsScope' - Allows you to scope the 'details' container and have multiple geocomplete fields on one page. Must be a parent of the input. Default is 'null'
  // * `location` - Location to initialize the map on. Might be an address `string` or an `array` with [latitude, longitude] or a `google.maps.LatLng`object. Default is `false` which shows a blank map.
  // * `bounds` - Whether to snap geocode search to map bounds. Default: `true` if false search globally. Alternatively pass a custom `LatLngBounds object.
  // * `autoselect` - Automatically selects the highlighted item or the first item from the suggestions list on Enter.
  // * `detailsAttribute` - The attribute's name to use as an indicator. Default: `"name"`
  // * `mapOptions` - Options to pass to the `google.maps.Map` constructor. See the full list [here](http://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions).
  // * `mapOptions.zoom` - The inital zoom level. Default: `14`
  // * `mapOptions.scrollwheel` - Whether to enable the scrollwheel to zoom the map. Default: `false`
  // * `mapOptions.mapTypeId` - The map type. Default: `"roadmap"`
  // * `markerOptions` - The options to pass to the `google.maps.Marker` constructor. See the full list [here](http://code.google.com/apis/maps/documentation/javascript/reference.html#MarkerOptions).
  // * `markerOptions.draggable` - If the marker is draggable. Default: `false`. Set to true to enable dragging.
  // * `markerOptions.disabled` - Do not show marker. Default: `false`. Set to true to disable marker.
  // * `maxZoom` - The maximum zoom level too zoom in after a geocoding response. Default: `16`
  // * `types` - An array containing one or more of the supported types for the places request. Default: `['geocode']` See the full list [here](http://code.google.com/apis/maps/documentation/javascript/places.html#place_search_requests).
  // * `blur` - Trigger geocode when input loses focus.
  // * `geocodeAfterResult` - If blur is set to true, choose whether to geocode if user has explicitly selected a result before blur.
  // * `restoreValueAfterBlur` - Restores the input's value upon blurring. Default is `false` which ignores the setting.

  var defaults = {
    bounds: true,
    strictBounds: false,
    country: null,
    map: false,
    details: false,
    detailsAttribute: "name",
    detailsScope: null,
    autoselect: true,
    location: false,

    mapOptions: {
      zoom: 14,
      scrollwheel: false,
      mapTypeId: "roadmap"
    },

    markerOptions: {
      draggable: false
    },

    maxZoom: 16,
    types: ['geocode'],
    blur: false,
    geocodeAfterResult: false,
    restoreValueAfterBlur: false
  };

  // See: [Geocoding Types](https://developers.google.com/maps/documentation/geocoding/#Types)
  // on Google Developers.
  var componentTypes = ("street_address route intersection political " +
    "country administrative_area_level_1 administrative_area_level_2 " +
    "administrative_area_level_3 colloquial_area locality sublocality " +
    "neighborhood premise subpremise postal_code natural_feature airport " +
    "park point_of_interest post_box street_number floor room " +
    "lat lng viewport location " +
    "formatted_address location_type bounds").split(" ");

  // See: [Places Details Responses](https://developers.google.com/maps/documentation/javascript/places#place_details_responses)
  // on Google Developers.
  var placesDetails = ("id place_id url website vicinity reference name rating " +
    "international_phone_number icon formatted_phone_number").split(" ");

  // The actual plugin constructor.
  function GeoComplete(input, options) {

    this.options = $.extend(true, {}, defaults, options);

    // This is a fix to allow types:[] not to be overridden by defaults
    // so search results includes everything
    if (options && options.types) {
      this.options.types = options.types;
    }

    this.input = input;
    this.$input = $(input);

    this._defaults = defaults;
    this._name = 'geocomplete';

    this.init();
  }

  // Initialize all parts of the plugin.
  $.extend(GeoComplete.prototype, {
    init: function(){
      this.initMap();
      this.initMarker();
      this.initGeocoder();
      this.initDetails();
      this.initLocation();
    },

    // Initialize the map but only if the option `map` was set.
    // This will create a `map` within the given container
    // using the provided `mapOptions` or link to the existing map instance.
    initMap: function(){
      if (!this.options.map){ return; }

      if (typeof this.options.map.setCenter == "function"){
        this.map = this.options.map;
        return;
      }

      this.map = new google.maps.Map(
        $(this.options.map)[0],
        this.options.mapOptions
      );

      // add click event listener on the map
      google.maps.event.addListener(
        this.map,
        'click',
        $.proxy(this.mapClicked, this)
      );

      // add dragend even listener on the map
      google.maps.event.addListener(
        this.map,
        'dragend',
        $.proxy(this.mapDragged, this)
      );

      // add idle even listener on the map
      google.maps.event.addListener(
        this.map,
        'idle',
        $.proxy(this.mapIdle, this)
      );

      google.maps.event.addListener(
        this.map,
        'zoom_changed',
        $.proxy(this.mapZoomed, this)
      );
    },

    // Add a marker with the provided `markerOptions` but only
    // if the option was set. Additionally it listens for the `dragend` event
    // to notify the plugin about changes.
    initMarker: function(){
      if (!this.map){ return; }
      var options = $.extend(this.options.markerOptions, { map: this.map });

      if (options.disabled){ return; }

      this.marker = new google.maps.Marker(options);

      google.maps.event.addListener(
        this.marker,
        'dragend',
        $.proxy(this.markerDragged, this)
      );
    },

    // Associate the input with the autocompleter and create a geocoder
    // to fall back when the autocompleter does not return a value.
    initGeocoder: function(){

      // Indicates is user did select a result from the dropdown.
      var selected = false;

      var options = {
        types: this.options.types,
        bounds: this.options.bounds === true ? null : this.options.bounds,
        componentRestrictions: this.options.componentRestrictions,
        strictBounds: this.options.strictBounds
      };

      if (this.options.country){
        options.componentRestrictions = {country: this.options.country};
      }

      this.autocomplete = new google.maps.places.Autocomplete(
        this.input, options
      );

      this.geocoder = new google.maps.Geocoder();

      // Bind autocomplete to map bounds but only if there is a map
      // and `options.bindToMap` is set to true.
      if (this.map && this.options.bounds === true){
        this.autocomplete.bindTo('bounds', this.map);
      }

      // Watch `place_changed` events on the autocomplete input field.
      google.maps.event.addListener(
        this.autocomplete,
        'place_changed',
        $.proxy(this.placeChanged, this)
      );

      // Prevent parent form from being submitted if user hit enter.
      this.$input.on('keypress.' + this._name, function(event){
        if (event.keyCode === 13){ return false; }
      });

      // Assume that if user types anything after having selected a result,
      // the selected location is not valid any more.
      if (this.options.geocodeAfterResult === true){
        this.$input.bind('keypress.' + this._name, $.proxy(function(){
          if (event.keyCode != 9 && this.selected === true){
              this.selected = false;
          }
        }, this));
      }

      // Listen for "geocode" events and trigger find action.
      this.$input.bind('geocode.' + this._name, $.proxy(function(){
        this.find();
      }, this));

      // Saves the previous input value
      this.$input.bind('geocode:result.' + this._name, $.proxy(function(){
        this.lastInputVal = this.$input.val();
      }, this));

      // Trigger find action when input element is blurred out and user has
      // not explicitly selected a result.
      // (Useful for typing partial location and tabbing to the next field
      // or clicking somewhere else.)
      if (this.options.blur === true){
        this.$input.on('blur.' + this._name, $.proxy(function(){
          if (this.options.geocodeAfterResult === true && this.selected === true) { return; }

          if (this.options.restoreValueAfterBlur === true && this.selected === true) {
            setTimeout($.proxy(this.restoreLastValue, this), 0);
          } else {
            this.find();
          }
        }, this));
      }
    },

    // Prepare a given DOM structure to be populated when we got some data.
    // This will cycle through the list of component types and map the
    // corresponding elements.
    initDetails: function(){
      if (!this.options.details){ return; }

      if(this.options.detailsScope) {
        var $details = $(this.input).parents(this.options.detailsScope).find(this.options.details);
      } else {
        var $details = $(this.options.details);
      }

      var attribute = this.options.detailsAttribute,
        details = {};

      function setDetail(value){
        details[value] = $details.find("[" +  attribute + "=" + value + "]");
      }

      $.each(componentTypes, function(index, key){
        setDetail(key);
        setDetail(key + "_short");
      });

      $.each(placesDetails, function(index, key){
        setDetail(key);
      });

      this.$details = $details;
      this.details = details;
    },

    // Set the initial location of the plugin if the `location` options was set.
    // This method will care about converting the value into the right format.
    initLocation: function() {

      var location = this.options.location, latLng;

      if (!location) { return; }

      if (typeof location == 'string') {
        this.find(location);
        return;
      }

      if (location instanceof Array) {
        latLng = new google.maps.LatLng(location[0], location[1]);
      }

      if (location instanceof google.maps.LatLng){
        latLng = location;
      }

      if (latLng){
        if (this.map){ this.map.setCenter(latLng); }
        if (this.marker){ this.marker.setPosition(latLng); }
      }
    },

    destroy: function(){
      if (this.map) {
        google.maps.event.clearInstanceListeners(this.map);
        google.maps.event.clearInstanceListeners(this.marker);
      }

      this.autocomplete.unbindAll();
      google.maps.event.clearInstanceListeners(this.autocomplete);
      google.maps.event.clearInstanceListeners(this.input);
      this.$input.removeData();
      this.$input.off(this._name);
      this.$input.unbind('.' + this._name);
    },

    // Look up a given address. If no `address` was specified it uses
    // the current value of the input.
    find: function(address){
      this.geocode({
        address: address || this.$input.val()
      });
    },

    // Requests details about a given location.
    // Additionally it will bias the requests to the provided bounds.
    geocode: function(request){
      // Don't geocode if the requested address is empty
      if (!request.address) {
        return;
      }
      if (this.options.bounds && !request.bounds){
        if (this.options.bounds === true){
          request.bounds = this.map && this.map.getBounds();
        } else {
          request.bounds = this.options.bounds;
        }
      }

      if (this.options.country){
        request.region = this.options.country;
      }

      this.geocoder.geocode(request, $.proxy(this.handleGeocode, this));
    },

    // Get the selected result. If no result is selected on the list, then get
    // the first result from the list.
    selectFirstResult: function() {
      //$(".pac-container").hide();

      var selected = '';
      // Check if any result is selected.
      if ($(".pac-item-selected")[0]) {
        selected = '-selected';
      }

      // Get the first suggestion's text.
      var $span1 = $(".pac-container:visible .pac-item" + selected + ":first span:nth-child(2)").text();
      var $span2 = $(".pac-container:visible .pac-item" + selected + ":first span:nth-child(3)").text();

      // Adds the additional information, if available.
      var firstResult = $span1;
      if ($span2) {
        firstResult += " - " + $span2;
      }

      this.$input.val(firstResult);

      return firstResult;
    },

    // Restores the input value using the previous value if it exists
    restoreLastValue: function() {
      if (this.lastInputVal){ this.$input.val(this.lastInputVal); }
    },

    // Handles the geocode response. If more than one results was found
    // it triggers the "geocode:multiple" events. If there was an error
    // the "geocode:error" event is fired.
    handleGeocode: function(results, status){
      if (status === google.maps.GeocoderStatus.OK) {
        var result = results[0];
        this.$input.val(result.formatted_address);
        this.update(result);

        if (results.length > 1){
          this.trigger("geocode:multiple", results);
        }

      } else {
        this.trigger("geocode:error", status);
      }
    },

    // Triggers a given `event` with optional `arguments` on the input.
    trigger: function(event, argument){
      this.$input.trigger(event, [argument]);
    },

    // Set the map to a new center by passing a `geometry`.
    // If the geometry has a viewport, the map zooms out to fit the bounds.
    // Additionally it updates the marker position.
    center: function(geometry){
      if (geometry.viewport){
        this.map.fitBounds(geometry.viewport);
        if (this.map.getZoom() > this.options.maxZoom){
          this.map.setZoom(this.options.maxZoom);
        }
      } else {
        this.map.setZoom(this.options.maxZoom);
        this.map.setCenter(geometry.location);
      }

      if (this.marker){
        this.marker.setPosition(geometry.location);
        this.marker.setAnimation(this.options.markerOptions.animation);
      }
    },

    // Update the elements based on a single places or geocoding response
    // and trigger the "geocode:result" event on the input.
    update: function(result){

      if (this.map){
        this.center(result.geometry);
      }

      if (this.$details){
        this.fillDetails(result);
      }

      this.trigger("geocode:result", result);
    },

    // Populate the provided elements with new `result` data.
    // This will lookup all elements that has an attribute with the given
    // component type.
    fillDetails: function(result){

      var data = {},
        geometry = result.geometry,
        viewport = geometry.viewport,
        bounds = geometry.bounds;

      // Create a simplified version of the address components.
      $.each(result.address_components, function(index, object){
        var name = object.types[0];

        $.each(object.types, function(index, name){
          data[name] = object.long_name;
          data[name + "_short"] = object.short_name;
        });
      });

      // Add properties of the places details.
      $.each(placesDetails, function(index, key){
        data[key] = result[key];
      });

      // Add infos about the address and geometry.
      $.extend(data, {
        formatted_address: result.formatted_address,
        location_type: geometry.location_type || "PLACES",
        viewport: viewport,
        bounds: bounds,
        location: geometry.location,
        lat: geometry.location.lat(),
        lng: geometry.location.lng()
      });

      // Set the values for all details.
      $.each(this.details, $.proxy(function(key, $detail){
        var value = data[key];
        this.setDetail($detail, value);
      }, this));

      this.data = data;
    },

    // Assign a given `value` to a single `$element`.
    // If the element is an input, the value is set, otherwise it updates
    // the text content.
    setDetail: function($element, value){

      if (value === undefined){
        value = "";
      } else if (typeof value.toUrlValue == "function"){
        value = value.toUrlValue();
      }

      if ($element.is(":input")){
        $element.val(value);
      } else {
        $element.text(value);
      }
    },

    // Fire the "geocode:dragged" event and pass the new position.
    markerDragged: function(event){
      this.trigger("geocode:dragged", event.latLng);
    },

    mapClicked: function(event) {
        this.trigger("geocode:click", event.latLng);
    },

    // Fire the "geocode:mapdragged" event and pass the current position of the map center.
    mapDragged: function(event) {
      this.trigger("geocode:mapdragged", this.map.getCenter());
    },

    // Fire the "geocode:idle" event and pass the current position of the map center.
    mapIdle: function(event) {
      this.trigger("geocode:idle", this.map.getCenter());
    },

    mapZoomed: function(event) {
      this.trigger("geocode:zoom", this.map.getZoom());
    },

    // Restore the old position of the marker to the last knwon location.
    resetMarker: function(){
      this.marker.setPosition(this.data.location);
      this.setDetail(this.details.lat, this.data.location.lat());
      this.setDetail(this.details.lng, this.data.location.lng());
    },

    // Update the plugin after the user has selected an autocomplete entry.
    // If the place has no geometry it passes it to the geocoder.
    placeChanged: function(){
      var place = this.autocomplete.getPlace();
      this.selected = true;

      if (!place.geometry){
        if (this.options.autoselect) {
          // Automatically selects the highlighted item or the first item from the
          // suggestions list.
          var autoSelection = this.selectFirstResult();
          this.find(autoSelection);
        }
      } else {
        // Use the input text if it already gives geometry.
        this.update(place);
      }
    }
  });

  // A plugin wrapper around the constructor.
  // Pass `options` with all settings that are different from the default.
  // The attribute is used to prevent multiple instantiations of the plugin.
  $.fn.geocomplete = function(options) {

    var attribute = 'plugin_geocomplete';

    // If you call `.geocomplete()` with a string as the first parameter
    // it returns the corresponding property or calls the method with the
    // following arguments.
    if (typeof options == "string"){

      var instance = $(this).data(attribute) || $(this).geocomplete().data(attribute),
        prop = instance[options];

      if (typeof prop == "function"){
        prop.apply(instance, Array.prototype.slice.call(arguments, 1));
        return $(this);
      } else {
        if (arguments.length == 2){
          prop = arguments[1];
        }
        return prop;
      }
    } else {
      return this.each(function() {
        // Prevent against multiple instantiations.
        var instance = $.data(this, attribute);
        if (!instance) {
          instance = new GeoComplete( this, options );
          $.data(this, attribute, instance);
        }
      });
    }
  };

})( jQuery, window, document );

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/dashboards/create');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }
        //console.log("credentials is....");
        //console.log($scope.credentials);

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
          //console.log('user response is..'+ response);
        $scope.authentication.user = response;
          //console.log($scope.authentication.user);

        // And redirect to the previous or home page
        //$state.go($state.previous.state.name || 'home', $state.previous.params);
          $location.path('/dashboards/create');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        $location.path('/dashboards/create');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
       $location.path('/dashboards/create');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;


    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });
    
    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
            console.log($scope.imageURL);
          }, 0);
        };
        //alert(fileReader);
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);
      //console.log(user);
      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the virtualmobiles module
angular.module('virtualmobiles').run(['Menus',
  function (Menus) {
 /*   // Add the virtualmobiles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Virtualmobiles',
      state: 'virtualmobiles',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'virtualmobiles', {
      title: 'List Virtualmobiles',
      state: 'virtualmobiles.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'virtualmobiles', {
      title: 'Create Virtualmobiles',
      state: 'virtualmobiles.create',
      roles: ['user']
    });*/
      
     
  }
]);

'use strict';

// Setting up route
angular.module('virtualmobiles').config(['$stateProvider',
  function ($stateProvider) {
    // virtualmobiles state routing
    $stateProvider
      .state('mobiles', {
        abstract: true,
        url: '/mobiles',
        template: '<ui-view/>'
      })
      .state('mobiles.list', {
        url: '',
        templateUrl: 'modules/virtualmobiles/client/views/list-virtualmobiles.client.view.html'
      })
      .state('mobiles.create', {
        url: '/create',
        templateUrl: 'modules/virtualmobiles/client/views/create-virtualmobile.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('mobiles.view', {
        url: '/:virtualmobileId',
        templateUrl: 'modules/virtualmobiles/client/views/view-virtualmobile.client.view.html'
      })
      .state('mobiles.edit', {
        url: '/:virtualmobileId/edit',
        templateUrl: 'modules/virtualmobiles/client/views/edit-virtualmobile.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// virtualmobiles controller
angular.module('virtualmobiles').controller('VirtualmobilesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Virtualmobiles',
  function ($scope, $stateParams, $location, Authentication, Virtualmobiles) {
    $scope.authentication = Authentication;

      var date = Number(new Date());
      function createobject(){
          /*var date = Number(new Date());
          console.log(date);
          var tag = $("#tagid").val().trim();
          var name = $("#name").val().trim();
          var email = $("#email").val().trim();
          var phoneno = $("#phoneno").val().trim();
          var userid = $("#userid").val().trim();
          var clientid = $("#clientid").val().trim();
          var complaint = $("#problemlist").find("option:selected").val().trim();
          var split = complaint.split(",");
var v1 = split[0];
var v2 = split[1];
          console.log("complant value is..");
          console.log(v1+","+v2);
          var obj = {
              ticketId : date,
              tagid : tag,
              status : "open",
              name : name,
              email : email,
              phonenumber : phoneno,
              complaint : v1,
              complaintid : v2,
              userid : userid,
              clientid : clientid
          }
          return obj;*/
          
          var userinfo = $scope.authentication.user;
          var obj = {};
          obj.userdetails = userinfo;
          obj.taginfo = {
              text : $("#tagid").val().trim(),
              format : "text"
          }
          console.log(obj);
          
      }
      
    // Create new virtualmobile
    $scope.create = function (isValid) {
        console.log("user info..");
        console.log($scope.authentication.user);
        $("#problemlist").hide(); 
        $(".problemlist").hide(); 
        
         var userinfo = $scope.authentication.user;
          
        console.log("client virtualmobile create controller")
      $(document).ready(function(){
          $("#mobilesub").click(function(){
                var value = $("#problemlist").find("option:selected").text().trim();
              console.log(value);
              if(value == ""){
                  
                  var filter = new Virtualmobiles({ 
                      userdetails : userinfo,
                      taginfo : {
                          text : $("#tagid").val().trim(),
                          format : "text"
                      },
                      probleminfo : ""
                  });
              }
              else{
                  
                  var complaint = $("#problemlist").find("option:selected").val().trim();
                  var split = complaint.split(",");
                  var v1 = split[0];
                  var v2 = split[1];
                  
                  var filter = new Virtualmobiles({ 
                      userdetails : userinfo,
                      taginfo : {
                          text : $("#tagid").val().trim(),
                          format : "text"
                      },
                      probleminfo : {
                          problem : v1,
                          code : v2
                      }
                  });
              }
                
                  // -------------------------Redirect after save----------------------
              filter.$save(function (response) {
                  //filter.$query(function (response) {
                  console.log("client controller redirect after save")
                  //$location.path('filters/' + response._id);
                  console.log("response is.. " + response);
                 
                  if(response.data != undefined){
                      $scope.resource = response.data;
                      console.log($scope.resource);

                      $("#problemlist").show(); 
                      $(".problemlist").show(); 
                      var select = document.getElementById("problemlist");
                      var options = $scope.resource;
                      /*for(var i = 0; i < options.length; i++) {
                          var opt = options[i];
                          var problemlist = document.createElement("option");
                          problemlist.textContent = opt;
                          problemlist.value = opt;
                          select.appendChild(problemlist);
                      }*/
                  }
                  else{
                      console.log(response.data );
                      $scope.value = response.data;
                      alert(response.message);
                  }

              }, function (errorResponse) {
                    console.log("error in .....")
                    $scope.error = errorResponse.data.message;
                  console.log($scope.error);
                });
              });
      })
    };

    // Remove existing virtualmobile
    $scope.remove = function (virtualmobile) {      
        console.log("client controller remove existing virtualmobile")    
      if (virtualmobile) {
        virtualmobile.$remove();

        for (var i in $scope.virtualmobiles) {
          if ($scope.virtualmobiles[i] === virtualmobile) {
            $scope.virtualmobiles.splice(i, 1);
          }
        }
      } else {
        $scope.virtualmobile.$remove(function () {
          $location.path('virtualmobiles');
        });
      }
    };

    // Update existing virtualmobile
    $scope.update = function (isValid) {
     console.log("client controller update existing virtualmobile")

      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'virtualmobileForm');

        return false;
      }

      var virtualmobile = $scope.virtualmobile;

      virtualmobile.$update(function () {
        $location.path('virtualmobiles/' + virtualmobile._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of virtualmobiles
    $scope.find = function () {
      $scope.virtualmobiles = Virtualmobiles.query();
    };

    // Find existing virtualmobile
    $scope.findOne = function () {
      $scope.virtualmobile = Virtualmobiles.get({
        virtualmobileId: $stateParams.virtualmobileId
      });
    };
  }
]);

'use strict';

//virtualmobiles service used for communicating with the virtualmobiles REST endpoints
angular.module('virtualmobiles').factory('Virtualmobiles', ['$resource',
  function ($resource) {
    return $resource('api/virtualmobiles/:virtualmobileId', {
      virtualmobileId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
