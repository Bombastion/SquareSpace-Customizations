<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script>
  // Prevent our heretical use of jQuery from messing with anything else
  jQuery.noConflict();
</script>
<script>
  NEWS_AND_TAG_URL = "https://www.lastpodcasts.com/news/?tag=";
  
  ROW_DIV = `<div class="row sqs-row"></div>`;
  
  // Used for the archive pages. Declaring as global variables so they can be populated for later use
  var mediaBlocks;
  var mostRecentBlock;
  var additionalMedia;

  pageDivIdDict = {};
  ARCHIVE_FIRST_PAGE_HOLDER_DIV_ID = "first-page-special-div";
  ARCHIVE_FIRST_PAGE_LINKS_DIV = "first-page-special-links-div";
  ARCHIVE_EPISODE_DIV_ID = "archive-episode-holder-div-page";
  ARCHIVE_PAGINATION_ROW = "archive-pagination-row";
  ARCHIVE_NEWER_ANCHOR_ID = "newer-link";
  ARCHIVE_OLDER_ANCHOR_ID = "older-link";
  EPISODE_DIV_CLASS = "archive-episode-page-div";
  
  // Convenience holder for information about each of the show feeds
  class ShowInfo
  {
	constructor(name, contactBlock, frontPageBlock, tagHtmlFormat)
    {
      	this.name = name;
      	// This is a block defined on `/contactblocks` which we can update once, see everywhere
		this.contactBlock = contactBlock;
      	// The block on the front page for the media container
      	this.frontPageBlock = frontPageBlock;
        // The tag to be plugged into our own RSS history call
      	this.tagHtmlFormat = tagHtmlFormat;
    }
  }
  
  // Global keys for each show
  GUNDAM_KEY = "gundam"
  LTOVG_KEY = "ltovg"
  JUMP_START_KEY = "jumpstart"

  // Construct a dict for each of the ShowInfo objects
  showInfoDict = {};
  showInfoDict[GUNDAM_KEY] = new ShowInfo(GUNDAM_KEY, "block-yui_3_17_2_1_1561052440799_5990", "block-66b346c06c2d42a021ad","It%27s+A+Gundam");
  showInfoDict[LTOVG_KEY] = new ShowInfo(LTOVG_KEY, "", "block-28f042e0cb7791b1526a", "LTOVG");
  showInfoDict[JUMP_START_KEY] = new ShowInfo(JUMP_START_KEY, "", "block-yui_3_17_2_1_1536870501231_13976",  "JS+Weekly");
  
  // Defines a general function for updating the front page media blocks
  function updateFrontPageAudioBlock(showInfo)
  {
    // Make sure we're actually on the front page
    windowSlug = window.location.pathname
    if(windowSlug == "/")
    {
        jQuery.ajax({
          type: "get",
          url: `${NEWS_AND_TAG_URL}${showInfo.tagHtmlFormat}&format=rss`,
          dataType: "xml",
          async: false,
          success: function(data) {
              // Find the latest post with a media block and grab its media and title
              latestMediaBlock = jQuery(data).find("media\\:content").first();
              mediaUrl = latestMediaBlock.attr("url");
              latestTitle = latestMediaBlock.siblings("title").html();
              audioBlock = jQuery("#" + showInfo.frontPageBlock).children().first().children().first();
              audioBlock.attr("data-url", mediaUrl);
              audioBlock.attr("data-title", latestTitle);
            }
        });
    }
  }
  
  function addPlayerDiv(jqueryElement, mediaUrl, mediaTitle)
  {
    jqueryElement.append(
        `<div class="col sqs-col-6 span-6">
<div class="sqs-block audio-block sqs-block-audio" data-block-type="41">
<div class="sqs-block-content">
  <div class="sqs-audio-embed"
    data-url="${mediaUrl}" data-mime-type=""
    data-title="${mediaTitle}" data-author="Last Podcasts" data-show-download="true" data-design-style="minimal" data-duration-in-ms="" data-color-theme="light">
  </div>
</div>
</div>
</div>`);
  }
  
  // Sweeps through the provided jQuery anchor elements and returns the first that contains the host name
  function extractMediaLink(anchors, hostName)
  {
    for (var index = 0; index < anchors.length; index++)
    {
      wrappedAnchor = jQuery(anchors[index]);
      url = wrappedAnchor.attr("href")
      if (url.includes(hostName))
      {
        return url;
      }
    }
    
    return "";
  }
  
  function addMediaLink(jqueryElement, mediaBlock, showInfo)
  {
    if(showInfo.name == GUNDAM_KEY)
    {
      // Try to grab the link to the media
      // The anchors are inconsistently at 2 different levels in the RSS ¯\_(ツ)_/¯
      anchors = []
      
      // Try the top level and add anything htat has an href
      encodedObjects = jQuery(mediaBlock.siblings("content\\:encoded").html())
      for(var index = 0; index < encodedObjects.length; index++)
      {
        if(jQuery(encodedObjects[index]).attr("href") != undefined)
        {
          anchors.push(encodedObjects[index]);
        }
      }
      
      // Some posts just have this encoded properly
      anchors = anchors.concat(encodedObjects.find("a").get().reverse())
      hostName = "crunchyroll.com";
      url = extractMediaLink(anchors, hostName);
      
      if(!(url.trim() === ''))
      {
        jqueryElement.append(`
<p style="text-align:center;white-space:pre-wrap;" class=""><a href="${url}">Watch the Episode</a></p>`);
      }
    }
  }
  
  function addShowLink(jqueryElement, showNotesUrl)
  {
    jqueryElement.append(`
<p style="text-align:center;white-space:pre-wrap;" class=""><a href="${showNotesUrl}">Show Notes</a></p>`);
  }
  
  function addHorizontalRule(jqueryElement)
  {
    jqueryElement.append(`
<div class="sqs-block horizontalrule-block sqs-block-horizontalrule" data-block-type="47"><div class="sqs-block-content"><hr></div></div>
    `);
  }
  
  function addTopPost(jqueryElement, mostRecentBlock, mediaUrl, mediaTitle, showNotesUrl, showInfo)
  {
    // This follows a different structure than the rest of the page
    // There's a row with 3 columns, each taking up 4 "blocks" in our 12 block grid
    // The center column actually contains the data
    
    // TODO: This is a mass of unreadable HTML, but it's mildly specialized. Refactor the common stuff later
    jqueryElement.append(`
<div class="row sqs-row">
<div class="col sqs-col-4 span-4"><div class="sqs-block spacer-block sqs-block-spacer sized vsize-1" data-block-type="21"><div class="sqs-block-content">&nbsp;</div></div></div>

<div class="col sqs-col-4 span-4">
<div class="sqs-block audio-block sqs-block-audio first-post-player first-post" data-block-type="41">
<div class="sqs-block-content">
  <div class="sqs-audio-embed"
    data-url="${mediaUrl}" data-mime-type=""
    data-title="${mediaTitle}" data-author="Last Podcasts" data-show-download="true" data-design-style="minimal" data-duration-in-ms="" data-color-theme="light">
  </div>
</div>
</div>
</div>

<div class="col sqs-col-4 span-4"><div class="sqs-block spacer-block sqs-block-spacer sized vsize-1" data-block-type="21"><div class="sqs-block-content">&nbsp;</div></div></div>
</div>

<div class="row sqs-row">
<div class="col sqs-col-4 span-4"><div class="sqs-block spacer-block sqs-block-spacer sized vsize-1" data-block-type="21"><div class="sqs-block-content">&nbsp;</div></div></div>

<div class="col sqs-col-4 span-4">
<div class="html-block sqs-block sqs-block-html first-post-text first-post">
<div class="sqs-block-content" id="${ARCHIVE_FIRST_PAGE_LINKS_DIV}">
</div></div></div>

<div class="col sqs-col-4 span-4"><div class="sqs-block spacer-block sqs-block-spacer sized vsize-1" data-block-type="21"><div class="sqs-block-content">&nbsp;</div></div></div>
</div>

`);
    
    linksDiv = jQuery(`#${ARCHIVE_FIRST_PAGE_LINKS_DIV}`);
    addMediaLink(linksDiv, mostRecentBlock, showInfo);
    addShowLink(linksDiv, showNotesUrl);
  }
  
  function addWhatsAGundamLink(jqueryElement)
  {
    jqueryElement.append(`
<div class="sqs-block html-block sqs-block-html" data-block-type="2"><div class="sqs-block-content"><h3 style="text-align:center;white-space:pre-wrap;"><a href="/what-gundam-1">Hey, What’s a Gundam?</a></h3></div></div>
    `);
  }
  
  function buildArchiveFirstPageSpecificBlocks(jqueryHolderElement, mostRecentBlock, showInfo)
  {
    // Grab the info to make a block
    mediaUrl = mostRecentBlock.attr("url");
    title = mostRecentBlock.siblings("title").html();
    showNotesLink = mostRecentBlock.siblings("link").html();
    
    // Add the first post and a spacer
    addTopPost(jqueryHolderElement, mostRecentBlock, mediaUrl, title, showNotesLink, showInfo);
    addHorizontalRule(jqueryHolderElement);
    
    // Add the What's A Gundam link
    addWhatsAGundamLink(jqueryHolderElement);
    addHorizontalRule(jqueryHolderElement);
  }
  
  function addPaginationLinks(pageNumber, pageSize, jqueryHolderElement, totalElements)
  {
    // Spacer first. It looks nicer ^_^
    jqueryHolderElement.append(`<div class="sqs-block spacer-block sqs-block-spacer sized vsize-1" data-block-type="21"><div class="sqs-block-content">&nbsp;</div></div>`);
    
    // Add a row to put our links in
    jqueryHolderElement.append(`<div class="row sqs-row" id="${ARCHIVE_PAGINATION_ROW}${pageNumber}">`);
    navigationRow = jQuery(`#${ARCHIVE_PAGINATION_ROW}${pageNumber}`);
    
    // Add the older link if required
    if(pageNumber > 1)
    {
    	navigationRow.append(`<div class="col sqs-col-6 span-6"><div class="sqs-block html-block sqs-block-html" data-block-type="2"><div class="sqs-block-content"><h2 style="text-align:left;white-space:pre-wrap;"><a id="${ARCHIVE_OLDER_ANCHOR_ID}${pageNumber}">OLDER</a></h2></div></div></div>`);
      	olderLink = jQuery(`#${ARCHIVE_OLDER_ANCHOR_ID}${pageNumber}`);
      	olderLink.click(function(){
          showArchivePage(pageDivIdDict, pageNumber - 1);
        });
    }
    else
    {
      navigationRow.append(`<div class="col sqs-col-6 span-6"><div class="sqs-block spacer-block sqs-block-spacer sized vsize-1" data-block-type="21"><div class="sqs-block-content">&nbsp;</div></div></div>`);
    }
    
    // Add the newer link if required
    hasMoreElements = (pageNumber * pageSize) < totalElements;
    if(hasMoreElements)
    {
    	navigationRow.append(`<div class="col sqs-col-6 span-6"><div class="sqs-block html-block sqs-block-html" data-block-type="2"><div class="sqs-block-content"><h2 style="text-align:right;white-space:pre-wrap;"><a id="${ARCHIVE_NEWER_ANCHOR_ID}${pageNumber}">NEWER</a></h2></div></div></div></div>`);
        newerLink = jQuery(`#${ARCHIVE_NEWER_ANCHOR_ID}${pageNumber}`);
      	newerLink.click(function(){
          showArchivePage(pageDivIdDict, pageNumber + 1);
        });
    }
    else
    {
      navigationRow.append(`<div class="col sqs-col-6 span-6"><div class="sqs-block spacer-block sqs-block-spacer sized vsize-1" data-block-type="21"><div class="sqs-block-content">&nbsp;</div></div></div>`);
    } 
  }
  
  // This loops through all of the media blocks, and builds containers for everything, hiding them as it goes
  function buildArchive(pageSize, jqueryHolderElement, mediaBlocks, mostRecentBlock, showInfo)
  {
    jqueryHolderElement.prepend(`<div id="${ARCHIVE_FIRST_PAGE_HOLDER_DIV_ID}"></div>`);
    jQuery(`#${ARCHIVE_FIRST_PAGE_HOLDER_DIV_ID}`).hide();
    buildArchiveFirstPageSpecificBlocks(jqueryHolderElement.children(), mostRecentBlock, showInfo);
    
    // Now, make the rest of the page        
    // Iterate over all of the elements and construct a div for each
    pageNumber = 1;
    endIndex = 0;
    while (endIndex < mediaBlocks.length)
    {
      // Make a container for this "page"
      jqueryHolderElement.append(`<div class="${EPISODE_DIV_CLASS}" id="${ARCHIVE_EPISODE_DIV_ID}${pageNumber}"></div>`);
      episodeDiv = jQuery(`#${ARCHIVE_EPISODE_DIV_ID}${pageNumber}`);
      episodeDiv.hide();
      
      // Add this div ID to the dict
      pageDivIdDict[pageNumber] = `${ARCHIVE_EPISODE_DIV_ID}${pageNumber}`;
      
      startIndex = (pageNumber - 1) * pageSize;
      endIndex = Math.min(startIndex + pageSize, mediaBlocks.length);
      mediaToDisplay = mediaBlocks.slice(startIndex, endIndex);

      // Toggles, indicating the need to create a containing row
      needsNewRow = true;
      var currentMediaRow;
      var currentLinksRow;
      mediaToDisplay.each(function(){
        // Create a new pair of rows if necessary
        if(needsNewRow)
        {
          currentMediaRow = jQuery(ROW_DIV);
          currentLinksRow = jQuery(ROW_DIV);
          episodeDiv.append(currentMediaRow);
          episodeDiv.append(currentLinksRow);
        }

        // Extract info from the media block read from RSS
        mediaBlock = jQuery(this);
        mediaUrl = mediaBlock.attr("url");
        title = mediaBlock.siblings("title").html();
        showNotesLink = mediaBlock.siblings("link").html();

        // Actually add the new info to the proper rows
        addPlayerDiv(currentMediaRow, mediaUrl, title);
        
        // Add the column for the links
        currentLinksRow.append(`
<div class="col sqs-col-6 span-6">
<div class="html-block sqs-block sqs-block-html">
<div class="sqs-block-content">
</div></div></div>`);
        
        linkContentDiv = currentLinksRow.children().children().children().last();

        addMediaLink(linkContentDiv, mediaBlock, showInfo);
        addShowLink(linkContentDiv, showNotesLink);

        // Invert our new row flag; this pairs posts together
        needsNewRow = !needsNewRow;
      });

      // Add the pagination links inside the episode div
      addPaginationLinks(pageNumber, pageSize, episodeDiv, mediaBlocks.length);
      
      // Increment our page
      pageNumber = pageNumber + 1;
    }
  }
  
  // Hides all pages except the current one
  function showArchivePage(pageDivIds, pageNumber)
  {
    jQuery(`.${EPISODE_DIV_CLASS}`).hide();
    
    if(pageNumber == 1)
    {
      jQuery(`#${ARCHIVE_FIRST_PAGE_HOLDER_DIV_ID}`).show();
    }
    else
    {
      jQuery(`#${ARCHIVE_FIRST_PAGE_HOLDER_DIV_ID}`).hide();
    }
    
    jQuery(`#${pageDivIds[pageNumber]}`).show();
  }
  
  function initArchive(showInfo)
  {
    // EXPERIMENTAL
    // Currently limited to the gundam archive page
    windowSlug = window.location.pathname;
    console.log(windowSlug);
    if(windowSlug == "/gundam-archive")
    {
      // Grab the main content area on the page
      mainBody = jQuery("main").children().children();
      mainBody.append(`<div class="row sqs-row"><div class="col sqs-col-12 span-12" id="archive-grid"></div></div>`);
      mainBody = mainBody.children().children();
      
      // Load the RSS feed and loop through the info
      earliestTime = 0;
      jQuery.ajax({
          type: "get",
          url: `${NEWS_AND_TAG_URL}${showInfo.tagHtmlFormat}&format=rss`,
          dataType: "xml",
          async: false,
          success: function(data) {
            // Find the latest post with a media block and grab its media and title
            mediaBlocks = jQuery(data).find("media\\:content");
            earliestTimeCandidate = Date.parse(jQuery(data).find("pubDate").last().html());            
            
            // Grab the first (and most recent) element, remove it from the list
            mostRecentBlock = jQuery(mediaBlocks.first());
            mediaBlocks = mediaBlocks.slice(1, mediaBlocks.length);
            
            while(earliestTimeCandidate != earliestTime) 
            {
                console.log(earliestTime + ", " + earliestTimeCandidate);
                earliestTime = earliestTimeCandidate;
                console.log(earliestTime);
                jQuery.ajax({
                    type: "get",
                    url: `${NEWS_AND_TAG_URL}${showInfo.tagHtmlFormat}&format=rss&offset=${earliestTime}`,
                    dataType: "xml",
                    async: false,
                    success: function(additionalData) {
                      additionalMedia = jQuery(additionalData).find("media\\:content");
                      if (additionalMedia.length > 0) 
                      {
                      mediaBlocks = jQuery.merge(mediaBlocks, additionalMedia);
                      earliestTimeCandidate = Date.parse(jQuery(additionalData).find("pubDate").last().html());
                      }
                    }
                });
              if (additionalMedia.length <= 0)
              {
                break;
              }
            }  
            
            // Order the media appropriately for each show
            // TODO: Allow for custom sort (ascending/descending)
            if(showInfo.name == GUNDAM_KEY)
            {
              mediaBlocks = jQuery(mediaBlocks.get().reverse());
            }

            // TODO: Allow a custom page size
			buildArchive(10, mainBody, mediaBlocks, mostRecentBlock, showInfo);
            
            showArchivePage(pageDivIdDict, 1)
     	  }
       });
    }
  }
  
  // Placeholder for creating an archive page

</script>
