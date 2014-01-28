ACME Ad Trackr
==============

This is an example [Backbone.js](http://backbonejs.org/) application that allows
users to create ads and newspapers, and a way to link them both. The application
visually displays which ads are being tracked by which newspapers.

I've tried to place documentation comments wherever it makes sense. Data is
stored in the web browser's `localStorage`, and the application has no validation
mechanisms whatsoever.

Usage
-----
The application has two lists: one for newspapers, one for ads.

I've provided some sensible defaults when bootstraping it for the first time,
but the application allows you to add more newspapers and ads by typing some
text into the appropriate field and clicking the _Add new_ button.

When selecting a newspaper from the list, the checkboxes in the ad list will be
enabled, allowing the user to mark ads to be tracked by that newspaper. A
newspaper can track as many ads as it wishes. Similarly, an ad can be tracked by
any number of newspapers.

Details
-------
Here are the basics:

* Each newspaper is a Backbone model that contains an `id` (string), a `name`
(string), and `ads` (array of Ad `id`s). All newspapers are stored in a Backbone
collection for persistence.
* Each ad is also a Backbone model that contains an `id` and `text`, both strings.
All ads are stored in a Backbone collection for persistence.
* Each list is a separate Backbone view that captures events for adding new models
and selecting existing ones from the list.
* When checking/unchecking ads for a newspaper, the ID of that ad gets
added to/removed from the corresponding newspaper `ads` array. The model gets
saved on the spot.
* When selecting a newspaper, all elements in the `ads` array are used to
populate which ads are selected by default.

More
----
You can easily view the stored data by using your browser's WebKit inspector. Go
to the _Resources_ tab and select this website from under _Local Storage_. The
data stored for each ad/newspaper directly corresponds to the Backbone model
attributes. The list of all ads is stored in `ACME-Ads` and the list of all
newspapers in `ACME-Newspapers`. You can manually edit/delete data from here.
