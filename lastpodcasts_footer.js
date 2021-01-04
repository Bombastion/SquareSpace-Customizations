<script>
  // Contact block. Only Gundam for now, and needs refactored eventually
  if(jQuery("article.tag-its-a-gundam div.sqs-block.html-block.sqs-block-html").length > 0) {
    jQuery("article.tag-its-a-gundam div.sqs-block.html-block.sqs-block-html").last().after('<div id="contact-div" class="sqs-block html-block sqs-block-html" data-block-type=2/>')
    jQuery("#contact-div").load("https://www.lastpodcasts.com/contactblocks #" + showInfoDict[GUNDAM_KEY].contactBlock + " > *")
  }
  
  // Loads the latest content for each block on the front page
  updateFrontPageAudioBlock(showInfoDict[GUNDAM_KEY]);
  updateFrontPageAudioBlock(showInfoDict[LTOVG_KEY]);
  updateFrontPageAudioBlock(showInfoDict[JUMP_START_KEY]);

  initArchive(showInfoDict[GUNDAM_KEY]);
</script>
