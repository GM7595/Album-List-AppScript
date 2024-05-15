function myFunction() 
{
  //univariables
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  //
  // Reset Sheet
  //
  for(var i=1; i<ss.getSheets().length; i++)
  {
    SpreadsheetApp.getActive().deleteSheet(SpreadsheetApp.getActive().getSheets()[i]);
  }
  Logger.log("Artist Sheet: " + sheet.getName());
  //
  // Artist Part Starts Here
  //
  var rows = [];
  var parent = DriveApp.getFolderById(''); // <- ENTER ID HERE
  Logger.log("Collection Folder: " + parent.getName());
  var myArtists = parent.getFolders();
  //clear the sheet, then create the headers
  sheet.clear();
  rows.push(["ID (Required for Album Extraction)","Name", "Url"]);
  // While there is another artist to process
  while(myArtists.hasNext()) {
    // Assign the next artist to the variable artist
    var artist = myArtists.next();
    // Check that the artist is not null just to be sure
    if(artist != null) {
      // Add the artist data (Id, name and url) to an array and add this array to the rows. 
      rows.push([artist.getId(),artist.getName(), artist.getUrl()]);
    }
  }
  sheet.getRange(1,1,rows.length,3).setValues(rows);
  //
  // Album Part Starts Here
  //
  var artistRows;
  // From 2nd row since first row contains headers, and rows.length-1 rows as last row is empty. 
  var artistData = sheet.getRange(2,1,rows.length-1,3).getValues().flat();
  var artistName = sheet.getRange(2,2,rows.length-1,1).getValues().flat().sort();
  // Check that the artist is not null just to be sure
  if(artistName!=null)
  {
    var artistFolder = [];
    for(var i=0; i<artistName.length; i++)
    {
      var artistSheet = SpreadsheetApp.getActive().getSheetByName(artistName[i]);
      Logger.log("Loading Albums from: " + artistName[i] + " (1/3 Steps)");
      //create sheet if null, else clear the sheet
      if(artistSheet != null)
      {
        artistSheet.clear();
      } else 
      {
        artistSheet = ss.insertSheet(artistName[i]);
      }
      //Getting the artist folders (that is in alphabet order) by ID for precision. 
      var OrderInArtistData = artistData.indexOf(artistName[i]);
      var artistId = artistData[OrderInArtistData-1];
      artistFolder[i] = DriveApp.getFolderById(artistId); 
      //clear previous artist data for each artist, then add the header 
      artistRows=[]; 
      artistRows.push(["Album Name", "Url"]); 
      //Add album data to array as before. 
      var myAlbums = artistFolder[i].getFolders(); 
      while(myAlbums.hasNext()) 
      { 
        album = myAlbums.next();
        if(album != null) 
        { 
          artistRows.push([album.getName(), album.getUrl()]); 
        } 
        artistSheet.getRange(1,1,artistRows.length,2).setValues(artistRows);
      }
    }
  }
  Logger.log("Loaded Albums (1/3 Complete)");
  //
  //Final Touches
  //
  for(var j=0; j<ss.getSheets().length; j++) 
  { 
    var sortSheet = ss.getSheets()[j]; 
    var sortSheetColumnLength = sortSheet.getDataRange().getNumRows();
    //log the rounded progress of the formatting process in %. 
    Logger.log("Formatting: "+ Math.trunc(Math.ceil(j/ss.getSheets().length*100)) + "% (2/3 Steps)");
    //alphabetical order 
    var sortRange = sortSheet.getRange("A2:C"+sortSheetColumnLength); 
    sortRange.sort({column: 2, ascending: true}); 
    //align everything to left 
    var alignRange = sortSheet.getRange("A1:C"+sortSheetColumnLength); 
    alignRange.setHorizontalAlignment("left"); 
    //header color (light green) 
    var header = sortSheet.getRange("A1:C1"); 
    header.setBackgroundColor('#BEFFBE'); 
    //background color (light yellow) 
    sortRange.setBackgroundColor('#FFFFCC'); 
    //resize columns based on longest value (might work inconsistently, idk) 
    sortSheet.autoResizeColumns(1,3); 
  }
  Logger.log("Formatted (2/3 Complete)")
  var sheetNameArray = [];

  for (var i = 0; i < ss.getSheets().length; i++) 
  {
    sheetNameArray.push(ss.getSheets()[i].getName());
  }
  
  sheetNameArray.sort();
    
  for( var j = 0; j < ss.getSheets().length; j++ ) 
  {
    Logger.log("Sorting Sheet Tabs: " + Math.trunc(Math.ceil(j/ss.getSheets().length*100))+"% (3/3 Steps)");
    ss.setActiveSheet(ss.getSheetByName(sheetNameArray[j]));
    ss.moveActiveSheet(j + 1);
  }
  Logger.log("Sheet Tabs Sorted (3/3 Complete)")
  ss.setActiveSheet(ss.getSheetByName("Artist List"));
  ss.moveActiveSheet(1);
}