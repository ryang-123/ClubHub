var sheet = SpreadsheetApp.getActiveSheet();
var data;
var calenderList = CalendarApp.getAllCalendars();
var calenderListIDs = getCalenderIDs();

function addCalender(id) {
  var calendar = CalendarApp.subscribeToCalendar(id);
  calendar.setSelected(true);
  return calendar.getName();
}

// Receives HTTP GET requests
function doGet(e) {
  if (e.parameter.page == 'CalManager') {
    return showCalenderManage();
  }
  else
  {
    if (e.parameter.update != null){
      return doUpdate(e);
    } else {
      return showHome();
    }
  }  
}

// Receives HTTP POST requests
function doPost(e){
    return doGet(e)
}

// Process form submissions for new calendars
function doUpdate(e){
  var added = ''; //Stores list of added calendars
  
  if (e.parameters.cal != null){
    for (var i = 0; i<e.parameters.cal.length; i++){
      if (added == '') {
        added = addCalender(e.parameters.cal[i])
      } else {
        added = added +', ' + addCalender(e.parameters.cal[i]);
      }
    }
  }

  page = HtmlService.createHtmlOutputFromFile('TopAfterUpdate'); // Load top of page
  
  // Add feedback information for user
  if (added == '') {
    page.append('No Calenders added');
  } else {
    page.append('The following calenders were added: ' + added);
  }
  
  var bottom = HtmlService.createHtmlOutputFromFile('BottomAfterUpdate'); // Load bottom of page
  
  page.append(bottom.getContent()); // Append bottom to page
  
  return page;
}

// Get and store the users current calendar IDs to prevent unnecessary API calls when comparing
function getCalenderIDs(){
  var result = [];
  for (var i = 0; i<calenderList.length; i++){
    result.push(calenderList[i].getId());
  }
  return result;
}

// Returns true if the user has the id passed
function hasCalender(id){
  for (var i = 0; i<calenderListIDs.length; i++){
    if (calenderListIDs[i] == id) 
      return true;
  }
  return false;
}

// Loads the Club Data from the spreadsheet
function loadData(){
  data = sheet.getRange('A2:D').getValues();
}

// Loads the Calender Manager page
function showCalenderManage(){
  loadData();
  var page = HtmlService.createHtmlOutputFromFile('TopCalenderManage');  
  var detailDiv = ''; //Variable to store html for right detail div
  var isAtLeastOneAdded = false;
  var caldID = '';
  
  // Add dynamic HTML
  for(var i = 0; i < data.length; i++){
    if (!hasCalender(data[i][3])) {
      isAtLeastOneAdded = true; //Records that at least one club was added
      page.append(
          '<li><button class="tablinks" onmouseover="openClub(event, \'c'+data[i][0]+
          '\')"><input type = "checkbox" name = "cal" value="'+data[i][3]+'">'+data[i][1]+'</button></li>');
      calID = data[i][3] + '';
      calID = calID.replace('@', '%40');
      calID = calID.replace('#', '%23');
      detailDiv = detailDiv + '<div id="c'+data[i][0]+'" class="tabcontent">'+
        //'<a href="javascript:trigger(this, '+calID+')">Preview Calender</a>'+        
        '<h3>'+data[i][1]+'</h3><p>'+data[i][2]+'</p></div>';
    }
  }
  if (!isAtLeastOneAdded) { page.append('<li>You are subscribed to all the calenders</li>') }
  page.append('</ul></div>');
  page.append(detailDiv);
  
  var bottom = HtmlService.createHtmlOutputFromFile('BottomCalenderManage'); //Load bottom of page
  page = page.append(bottom.getContent()); //Append bottom of page
  Logger.log(page.getContent());
  return page;
}

function showHome(){
  return HtmlService.createHtmlOutputFromFile('home');
}