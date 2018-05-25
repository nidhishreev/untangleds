
var sent1,send1,send;
var app = angular.module('myApp',['ngTouch', 'ui.grid','ui.grid.exporter','ui.grid.selection','ui.grid.pagination']);
app.controller('customersCtrl' ,  ['$scope','$http', '$interval', '$q','$filter',"exportUiGridService",'uiGridExporterService','uiGridExporterConstants', function ($scope, $http, $interval, $q, $filter,exportUiGridService,uiGridExporterService, uiGridExporterConstants){
    
    
    

  $http.get("http://10.0.1.2:8080/data").then(function (response) { 
	  console.log(response);
	  if(response.status == 200 ){
		  var data = response.data;// reading data from server
			
		  $scope.addfilter=data.filters.addfilter;
		  
		  
			$scope.status=data.status.first;
	  		$scope.statusSub=data.status.second;
  
	  		$scope.tracker=data.addfilter_details.tracker.first;
	  		$scope.trackerSub=data.addfilter_details.tracker.second;
		  
			$scope.priority=data.addfilter_details.priority.first;
	  		$scope.prioritySub=data.addfilter_details.priority.second;

		  
		  	$scope.subject=data.addfilter_details.subject;
		  
		  	$scope.assignee=data.addfilter_details.assignee.first;
	  		$scope.assigneeSub=data.addfilter_details.assignee.second;
		  
	

		    $scope.filterdetails=data.addfilter_details.date;
		
		  
		    $scope.tabledata=data.tbldata;
		  
		    $scope.query=data.save;
	
         
	  }	  
      else {
		  window.alert(" Cannot get data from server.");
	  }
     
  });
     tablegrid(); 
    
   function filter() {
      
           

                var obj0={},obj=[],obj1={},obj2={},obj3={},obj4={},obj5={},obj6={},obj7={},obj8={},obj9={};
                var arr=[],table;

                if($('#cbSelection').is(":checked")){
                    var key = $('label[for="status"]').text().trim();
                    var data = $("#select1").find("option:selected").text().trim();
                    var data1 = $("#see").val().trim();
                }
                if($('#s2').is(":checked")){
                    var key1 = $('label[for="assignee"]').text().trim();
                    var data0 = $("#select2").find("option:selected").text().trim();
                    var data01 = $("#see1").val().trim();
                    //alert(data01);
                }
                if($('#s3').is(":checked")){
                    var key2 = $('label[for="tracker"]').text().trim();
                    var data2 = $("#select03").find("option:selected").text().trim();
                    var data02 = $("#see2").val().trim();
                    //alert(data2);
                }
                if($('#s4').is(":checked")){
                    var key3 = $('label[for="subject"]').text().trim();
                    var data3 = $("#select4").find("option:selected").text().trim();
                    var data03 = $("#see3").val().trim();
                }
                if($('#s5').is(":checked")){
                    var key4 = $('label[for="priority"]').text().trim();
                    var data4 = $("#select5").find("option:selected").text().trim();
                    var data04 = $("#see4").val().trim();
                }
                if($('#s6').is(":checked")){
                    var key5 = $('label[for="create"]').text().trim();
                    var data5 = $("#select6").val().trim();
                    alert("data5 is"+data5);
                    var data05 = $("#see5").val().trim();
                    alert("data05 is"+data05);
                    var data005 = $("#see05").val().trim();
                }
                if($('#s7').is(":checked")){
                    var key6 = $('label[for="updated"]').text().trim();
                    var data6 = $("#select7").val().trim();
                    var data06 = $("#see6").val().trim();
                    var data006 = $("#see06").val().trim();
                }
                if($('#s8').is(":checked")){
                    var key7 = $('label[for="closed"]').text().trim();
                    var data7 = $("#select8").val().trim();
                    var data07 = $("#see7").val().trim();
                    var data007 = $("#see07").val().trim();
                }
                if($('#s9').is(":checked")){
                    var key8 = $('label[for="startdate"]').text().trim();
                    var data8 = $("#select9").val().trim();
                    var data08 = $("#see8").val().trim();
                    var data008 = $("#see08").val().trim();
                }
                if($('#s10').is(":checked")){
                    var key9 = $('label[for="duedate"]').text().trim();
                    var data9 = $("#select10").val().trim();
                    var data09 = $("#see9").val().trim();
                    var data009 = $("#see09").val().trim();
                }
                


                obj.push(data);
       
                 if(obj[0] != undefined){
                alert(data1);
               if(data1 != ""){
                   obj.push(data1);
                arr.push({ status: obj });
                   alert("obj[1]"+arr);
               }
                     else{
                     arr.push({ status: [obj[0]] });
                         alert("arr is"+arr);
                     }
                }

        //assignee-------------------
                   obj=[];

                obj.push(data0);
                if(obj[0] != undefined){ 
                obj.push(data01);

                console.log(obj);
                /*obj1[key1]=obj;
                data+=obj1;*/

                arr.push({ assignee: obj });
               }
        //tracker------------------------
                    obj=[];

                obj.push(data2);
                 if(obj[0] != undefined){
                obj.push(data02);
                //obj2[key2]=obj;
                arr.push({ tracker: obj });
                }
       //subject--------------------------
                obj=[];

                obj.push(data3);
                 if(obj[0] != undefined){
                obj.push(data03);
                //obj3[key3]=obj;
                arr.push({ subject: obj });
                }
       //priority-------------------------
                obj=[];

                obj.push(data4);
                 if(obj[0] != undefined){
                obj.push(data04);
                //obj4[key4]=obj;
                arr.push({ priority: obj });
                }
       //created----------------------------
                obj=[];
                obj.push(data5);
                if(obj[0] != undefined){
                     alert(data05);
                    alert(data05 != "");
                    if(data05 != ""){
                    
                     obj.push(data05);
                         alert(data005);
                         if(data005 != ""){
                             obj.push(data005);
                            arr.push({date:{ created: obj }}); 
                         }
                         else{
                             arr.push({date:{ created: obj }});
                         }
                    }
                    else{
                             arr.push({date:{ created: obj }});
                         }
                }
            
       
       //updated------------------------------
                obj=[];

                obj.push(data6);
                 if(obj[0] != undefined){
                    if(data06 != ""){
                    
                     obj.push(data06);
                         alert(data006);
                         if(data006 != ""){
                             obj.push(data006);
                            arr.push({date:{ updated: obj }}); 
                         }
                         else{
                             arr.push({date:{ updated: obj }});
                         }
                    }
                    else{
                             arr.push({date:{ updated: obj }});
                         }
                }
       //closed date-----------------------------
                obj=[];

                obj.push(data7);
                 if(obj[0] != undefined){
                    if(data07 != ""){
                    
                     obj.push(data07);
                         alert(data007);
                         if(data007 != ""){
                             obj.push(data007);
                            arr.push({date:{ closeddate: obj }}); 
                         }
                         else{
                             arr.push({date:{ closeddate: obj }});
                         }
                    }
                    else{
                             arr.push({date:{ closeddate: obj }});
                         }
                
                }
       //start date---------------------------------
                obj=[];

                obj.push(data8);
                 if(obj[0] != undefined){
                    if(data8 != ""){
                    
                     obj.push(data08);
                         alert(data008);
                         if(data008 != ""){
                             obj.push(data008);
                            arr.push({date:{ startdate: obj }}); 
                         }
                         else{
                             arr.push({date:{ startdate: obj }});
                         }
                    }
                    else{
                             arr.push({date:{ startdate: obj }});
                         }
                
                }
       //duedate-------------------------------------
                obj=[];

                obj.push(data9);
                 if(obj[0] != undefined){
                     if(data9 != ""){
                    
                     obj.push(data09);
                         alert(data009);
                         if(data009 != ""){
                             obj.push(data009);
                            arr.push({date:{ duedate: obj }}); 
                         }
                         else{
                             arr.push({date:{ duedate: obj }});
                         }
                    }
                    else{
                             arr.push({date:{ duedate: obj }});
                         }
                
                }
                return arr;
                console.log("arr is : "+arr);
                
             /*   $.ajax({
            type: "POST",
            url: "http://localhost:8080/find",
            // The key needs to match your method's input parameter (case-sensitive).
            data: JSON.stringify(arr),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                alert(data);
                $scope.tabledata = data;
                console.log("table data is "+tabledata);
                tablegrid($scope.tabledata);
                 },
            failure: function(errMsg) {
                alert(errMsg);
            }
        });

            $http.post('http://localhost:8080/find', JSON.stringify(arr)).then(function (response) {
                if (response.data)
                     console.log(response);
                $scope.msg = "Post Data Submitted Successfully!";
            });*/

                 
             

    }
$(document).ready(function(){  
     $(".apply").click(function(){
    var sent = filter();
    var result = JSON.stringify(sent);

        $http.post('http://10.0.1.2:8080/find',result ).then(function (response) {
           // alert(response.data);    
            if(response.status == 200 ){
                $scope.msg = "Post Data Submitted Successfully!";
                $scope.tabledata = response.data;
            }
            else {
                  window.alert(" Cannot get data from server.");
              }

            tablegrid();
        });
 });
});
    
$(document).ready(function(){  
  
         $(".queryname").on('click','li',function (){
             alert("hi...")
    //alert($(this).html());
       sent1 = $(this).html();
             alert(sent1);
             
             console.log($scope.query);
             var y = $scope.query;
             
             for (w in y){
                 for(x in y[w]){
                     //console.log("key is :" + x);
                 console.log("data is "+y[w].queryname);
                     /*console.log(sent1);
                     console.log(y[w].queryname);
                     console.log(sent1.trim() == y[w].queryname);*/
                     if(sent1.trim() == y[w].queryname){
                         
                         var result = JSON.stringify(y[w].filterquery);
                         console.log(result);
                     }
                     
                 }
             }
   
                console.log("res is "+result);

        $http.post('http://10.0.1.2:8080/find',result ).then(function (response) {
           // alert(response.data);    
            if(response.status == 200 ){
                $scope.msg = "Post Data Submitted Successfully!";
                $scope.tabledata = response.data;
            }
            else {
                  window.alert(" Cannot get data from server.");
              }

            tablegrid();
        });
 });
});
   
   
    
$(document).ready(function(){ 
    $("#savehoverbutton").click(function(){
        alert("in save")
    var userid = 01;
    var sent = filter();
    var name = $('#input').val();
       result = {
            userid:userid,
            username:"abc",
            queryname:name,
            filterquery:sent
        }
        console.log(result);

        $http.post('http://10.0.1.2:8080/save', result).then(function (response) {
            //alert(response.data);    
            if(response.status == 202 ){
                $scope.msg = "Post Data Submitted Successfully!";
                $scope.tabledata = response.data;
                console.log("data is :"+response.data)
                 window.alert($scope.msg);
            }
            else {
                  window.alert(" Cannot get data from server.");
              }

        });
          var sent = filter();
    var result = JSON.stringify(sent);

        $http.post('http://10.0.1.2:8080/find',result ).then(function (response) {
            //alert(response.data);    
            if(response.status == 200 ){
                $scope.msg = "Post Data Submitted Successfully!";
                $scope.tabledata = response.data;
            }
            else {
                  window.alert(" Cannot get data from server.");
              }

            tablegrid();
        });
    });
    
    /*$(".xyz").click(function(){
    var sent = filter();
    var result = JSON.stringify(sent);

        $http.post('http://localhost:8080/find',result ).then(function (response) {
            alert(response.data);    
            if(response.status == 200 ){
                $scope.msg = "Post Data Submitted Successfully!";
                $scope.tabledata = response.data;
            }
            else {
                  window.alert(" Cannot get data from server.");
              }

            tablegrid();
        });
 });*/
});
  $(document).ready(function(){ 
     $(".queryname").on('click','li',function (){
          //   alert("hi...")
         //alert($(this).html());
       sent1 = $(this).html();
     });
  });
$(document).ready(function(){ 
    
             
         $(".pqr").click(function(){  
             alert("in delete");
             console.log($scope.query);
             var y = $scope.query;
          
             for (w in y){
                 for(x in y[w]){
                     //alert("sent1 is "+sent1);
                    // alert(y[w].queryname);
                     //alert(sent1.trim() == y[w].queryname.trim());
                     if(sent1.trim() == y[w].queryname.trim()){
                         
                         var result = (y[w]._id);
                         
                     }
                     
                 }
             }
       alert("res is "+result);
                console.log("res is "+result);

        $http.post('http://10.0.1.2:8080/delete',{_id:result} ).then(function (response) {
            //alert(response.data);    
            if(response.status == 200 ){
                $scope.msg = "Post Data Submitted Successfully!";
                $scope.tabledata = response.data;
            }
            else {
                  window.alert(" Cannot get data from server.");
              }

        });
    });
});     

$(document).ready(function () {
    $(".abc").hide();
    $(".queryname").on('click','li',function (){
       send = $(this).html();
        console.log(send);
        $(".name1").val(send); 
        $(".abc").show();
        $("#myBtn").hide();
     });
        
      $(".edit").click(function()  {
        $(".xyz").click(function(){  
          alert("in edit");
            alert(send);
        var y = $scope.query;
             for (w in y){
                 for(x in y[w]){
                    /* alert("in x");
                     alert(y[w].queryname);
                     alert("condition is : "+send.trim() == y[w].queryname);*/
                     if(send.trim() == y[w].queryname.trim()){
                         alert("true....");
                         var result1 = y[w]._id;
                         
                     }
                     
                 }
             }
            alert(result1);
        var userid = 01;
        var sent = filter();
        var name = $('#input').val();
        result = {
            _id:result1,
            userid:userid,
            username:"abc",
            queryname:name,
            filterquery:sent
         }
        console.log(result);

        $http.post('http://10.0.1.2:8080/save', result).then(function (response) {
            alert(response.data);    
            if(response.status == 202 ){
                $scope.msg = "Post Data Submitted Successfully!";
                $scope.tabledata = response.data;
                console.log("data is :"+response.data)
                 window.alert($scope.msg);
            }
            else {
                  window.alert(" Cannot get data from server.");
              }

        });
          
        var sent = filter();
        var result = sent;

        $http.post('http://10.0.1.2:8080/find',result ).then(function (response) {
           // alert(response.data);    
            if(response.status == 200 ){
                $scope.msg = "Post Data Submitted Successfully!";
                $scope.tabledata = response.data;
            }
            else {
                  window.alert(" Cannot get data from server.");
              }

            tablegrid();
        });
      });
          
    });
        
});
    
    
  function tablegrid() { 
         $scope.downloadCSV = function(){
  $scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE,uiGridExporterConstants.ALL);
}

 $scope.downloadPDF = function(){
  $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.VISIBLE,uiGridExporterConstants.ALL);
}
 $scope.downloadExcel = function(){
	 $scope.gridApi.exporter.exportDataAsExcel(uiGridExporterConstants.VISIBLE,uiGridExporterConstants.ALL);
 }




	 var fakeI18n = function( title ){
    var deferred = $q.defer();
    $interval( function() {
      deferred.resolve( '' + title );
    }, 1000, 1);
    return deferred.promise;
  };

  $scope.gridOptions = {
      
      data:'tabledata',
    exporterCsv: false,
    enableGridMenu: true,
	   gridMenuCustomItems: [{
                    title: 'Export all data as EXCEL',
                    action: function ($event) {
                        exportUiGridService.exportToExcel('sheet 1', $scope.gridApi, 'all', 'all');
                    },
                    order: 110
                },
                {
                    title: 'Export visible data as EXCEL',
                    action: function ($event) {
                        exportUiGridService.exportToExcel('sheet 1', $scope.gridApi, 'visible', 'visible');
                    },
                    order: 111
                }
            ],
	  enableFiltering:false,
 /* useExternalFiltering:false,*/
	  enableColumnMenus: false,
	  enableAutoFitColumns: false,
      enableColumnResizing: false,
    gridMenuTitleFilter: fakeI18n,
	  paginationPageSizes:[15,25,35, 50],
	  //paginationPageSize:15,
    columnDefs: [
      { name: 'id'},
      { name: 'tracker'},
      { name: 'status'},
      { name: 'priority'},
      { name: 'subject',width:"**"},
      { name: 'assignee'},
      { name: 'updated',width:"**" },
      { name: 'created',width:"**" }
 ],
	      enableSelectAll: true,
	  
    exporterCsvFilename: 'Report.csv',
    exporterPdfDefaultStyle: {fontSize: 9},
    exporterPdfTableStyle: {margin: [10, 10, 10, 10]},
    exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: false, color: 'Black'},
    exporterPdfHeader: { text: "Web functionality - Issues", style: 'headerStyle' },
    exporterPdfFooter: function ( currentPage, pageCount ) {
      return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
    },
    exporterPdfCustomFormatter: function ( docDefinition ) {
      docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
      docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
      return docDefinition;
    },
    exporterPdfOrientation: 'landscape',
    exporterPdfPageSize: 'LETTER',
    exporterPdfMaxGridWidth: 630,
    exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    onRegisterApi: function( gridApi ){
      $scope.gridApi = gridApi;
		
		$scope.gridApi.grid.registerRowsProcessor( $scope.singleFilter, 200 );

      // interval of zero just to allow the directive to have initialized
      $interval( function() {
        gridApi.core.addToGridMenu( gridApi.grid, [{ title: 'Dynamic item', order: 100}]);
      }, 0, 1);

      gridApi.core.on.columnVisibilityChanged( $scope, function( changedColumn ){
        $scope.columnChanged = { name: changedColumn.colDef.name, visible: changedColumn.colDef.visible };
      });	
    }  
  };


	$scope.filter = function() {
    $scope.gridApi.grid.refresh();
  };
    
  $scope.singleFilter = function( renderableRows ){
    var matcher = new RegExp($scope.filterValue);

	 
    renderableRows.forEach( function( row ) {
      var match1 = false;
      [ 'tracker', 'status', 'priority','subject','assignee','updated','created'].forEach(function( name ){
		 
        if ( row.entity[name].match(matcher) ){
          match1 = true;
        }
      });
      if ( !match1 ){
        row.visible = false;
      }
    });
    return renderableRows;
  }
  
  }
      }]);      
         
         app.factory('exportUiGridService', exportUiGridService);

    exportUiGridService.inject = ['uiGridExporterService'];
    function exportUiGridService(uiGridExporterService) {
        var service = {
            exportToExcel: exportToExcel
        };

        return service;

        function Workbook() {
            if (!(this instanceof Workbook)) return new Workbook();
            this.SheetNames = [];
            this.Sheets = {};
        }

        function exportToExcel(sheetName, gridApi, rowTypes, colTypes) {
			console.log("  sheetName "+ sheetName);
			console.log("  gridAPI  "+gridApi);
			console.log("  rowTypes  "+rowTypes);
			console.log("  colTypes  "+colTypes);
            var columns = gridApi.grid.options.showHeader ? uiGridExporterService.getColumnHeaders(gridApi.grid, colTypes) : [];
            var data = uiGridExporterService.getData(gridApi.grid, rowTypes, colTypes);
            var fileName = gridApi.grid.options.exporterExcelFilename ? gridApi.grid.options.exporterExcelFilename : 'Report';
            fileName += '.xlsx';
            var wb = new Workbook(),
                ws = sheetFromArrayUiGrid(data, columns);
            wb.SheetNames.push(sheetName);
            wb.Sheets[sheetName] = ws;
            var wbout = XLSX.write(wb, {
                bookType: 'xlsx',
                bookSST: true,
                type: 'binary'
            });
            saveAs(new Blob([s2ab(wbout)], {
                type: 'application/octet-stream'
            }), fileName);
        }

        function sheetFromArrayUiGrid(data, columns) {
            var ws = {};
            var range = {
                s: {
                    c: 10000000,
                    r: 10000000
                },
                e: {
                    c: 0,
                    r: 0
                }
            };
            var C = 0;
            columns.forEach(function (c) {
                var v = c.displayName || c.value || columns[i].name;
                addCell(range, v, 0, C, ws);
                C++;
            }, this);
            var R = 1;
            data.forEach(function (ds) {
                C = 0;
                ds.forEach(function (d) {
                    var v = d.value;
                    addCell(range, v, R, C, ws);
                    C++;
                });
                R++;
            }, this);
            if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
            return ws;
        }
        /**
         * 
         * @param {*} data 
         * @param {*} columns 
         */

        function datenum(v, date1904) {
            if (date1904) v += 1462;
            var epoch = Date.parse(v);
            return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
        }

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        function addCell(range, value, row, col, ws) {
            if (range.s.r > row) range.s.r = row;
            if (range.s.c > col) range.s.c = col;
            if (range.e.r < row) range.e.r = row;
            if (range.e.c < col) range.e.c = col;
            var cell = {
                v: value
            };
            if (cell.v == null) cell.v = '-';
            var cell_ref = XLSX.utils.encode_cell({
                c: col,
                r: row
            });

            if (typeof cell.v === 'number') cell.t = 'n';
            else if (typeof cell.v === 'boolean') cell.t = 'b';
            else if (cell.v instanceof Date) {
                cell.t = 'n';
                cell.z = XLSX.SSF._table[14];
                cell.v = datenum(cell.v);
            } else cell.t = 's';

            ws[cell_ref] = cell;
        }
    }

    
  