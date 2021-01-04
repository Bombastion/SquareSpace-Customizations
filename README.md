# SquareSpace-Customizations

Welcome to the collection of hacks, etc., used on https://www.lastpodcasts.com/ to make our multi-feed system work on SquareSpace.

Most of the work is done in the code injection header, which sets up all the functions. The primary entry points are then called by the code injection footer. Most of the complicated bits are written with jQuery.

The existing code also relies on some known div IDs staying constant. Specifically, the audio blocks on the front page need to stay the same to have their content swapped, and there is a separate page of contact info to allow us to update that per feed and automatically update all existing episodes.

## Existing functionality

### `ShowInfo`
Every feed is represented by a `ShowInfo`, which contains all of the unique attributes about a feed. These are stored in a dict, and the key to the appropriate feed is passed around (it's also used to differentiate behavior in some spots).

### Front Page Blocks
The first thing we automated was updating blocks on the front page. This is accomplished by calling a function per `ShowInfo` we want to display. The function then uses an async call to load SquareSpace's RSS feed for that show, grab the first element, then populate a known audio block ID with info from that element. 

Coincidentally, if you go to edit the front page of our site, you can see that all the shows stopped being manually updated ages ago.

### Contact Blocks
Technically just a beta feature used only by It's A Gundam, this pulls from a page located at https://www.lastpodcasts.com/contactblocks, which contains some relatively static divs with known IDs. There's some custom logic that checks which type of page we're on, then pulls the appropriate contact block and inserts it. Because this is currently post page-load, though, this info is only visible on the website, and not through the RSS feed.

### Automated Archive
Somewhere just beyond beta, It's A Gundam implements a fully automated archive page. The basic logic for this is:
* Scrape our RSS feed for all elements
* Build a special "first page" element
* Build divs in the appropriate spots for each element
* Add links which are visible/hidden depending on the current page number
* Let jQuery take care of showing/hiding the appropriate blocks based on page number on `onClick` events on the links

Obviously, this isn't _super_ efficient, but I played around with a variety of approaches and SquareSpace squashed some of my more clever ideas.

## Planned Features/Improvements
* Automated archives for other feeds
* Custom page sizes on archives
* Use contact blocks in other feeds
* Update contact blocks to be inserted during/before RSS publish
* Fix SquareSpace's 100 episode limit. Their RSS feed gives this as the largest option, so we'll need to publish our own feed eventually. The tentative plan is to have a custom page per show which just has its entire body populated in the injected JS header
