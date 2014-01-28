$(function(){

    // Define a Newspaper model
    var Newspaper = Backbone.Model.extend({
        // Ads are initialized as an empty array
        defaults: { ads: [] },

        // Persist data locally
        localStorage: new Backbone.LocalStorage('ACME-Newspapers'),

        // Provide a way of highlighting the current newspaper
        highlight: function() {
            var $newspaper = $('#' + this.id);
            if ($newspaper.prop('checked')) {
                $newspaper.parents('li').css({ 'background-color': '#729fcf' });
            } else {
                $newspaper.parents('li').css({ 'background-color': '#fff' });
            }
            return this;
        }
    });

    // Define collection of Newspaper models
    var Newspapers = Backbone.Collection.extend({
        model: Newspaper,

        // Persist data locally
        localStorage: new Backbone.LocalStorage('ACME-Newspapers'),

        // Clear all newspaper highlights
        clearHighlights: function() {
            $('#newspaper-list .item').css({ 'background-color': '#fff' });
            return this;
        }
    });

    // Backbone.js View for the list of newspapers
    var NewspaperList = Backbone.View.extend({
        // Provide some limited scope to the view
        el: $('#newspapers'),

        initialize: function() {
            // Render initially (since we're providing defaults)
            this.render();

            // Re-render list whenever new models are added to the Newspaper
            // collection.
            this.listenTo(this.collection, 'add', this.render);

            // Good idea to do this for many non-triggered functions to allow
            // chained function calls.
            return this;
        },

        render: function() {
            // Load list-item template from `index.html`
            var template = _.template($('#newspaper-item').html());

            // Empty list before populating it from scratch. This is highly
            // inefficient and your browser will get slow once you start adding
            // several thousand newspapers.
            $('ul#newspaper-list').empty();
            this.collection.forEach(function(newspaper) {
                // Append list-item (from loaded template) to the unordered list
                $('ul#newspaper-list').append(template({ model: newspaper }));
            });
            return this;
        },

        // Events that trigger function calls
        events: {
            'click #newspaper-add': 'addNewspaper',
            'change input.newspaper-radio': 'selectNewspaper'
        },

        // Triggered when adding a new newspaper
        addNewspaper: function(event) {
            // Save a new Newspaper model and add to the Newspapers collection
            var newspaper = new Newspaper({ name: $('#newspaper-name').val() });
            newspaper.save();
            this.collection.add(newspaper);

            // Let's try to be user-friendly here
            $('#newspaper-name').val('').focus();

            // Clear ad selections
            ads.uncheckAll().clearHighlights();
            $('input.ad-checkbox').prop('disabled', true);
        },

        // Triggered when selecting a newspaper
        selectNewspaper: function(event) {
            var $target = $(event.currentTarget);

            // Re-enable ad checkboxes
            $('input.ad-checkbox').prop('disabled', false);

            // Clear selection coloring
            this.collection.clearHighlights();
            ads.clearHighlights();

            // Uncheck all ads, so that we can re-check the ones that matter
            ads.uncheckAll();

            // Find selected newspaper model
            var newspaper = this.collection.get($target.attr('id'));
            newspaper.highlight();

            // Check and highlight all associated ads
            _.each(newspaper.get('ads'), function(ad) {
                ad = ads.get(ad);
                if (ad) {
                    ad.check(true).highlight();
                }
            });
        }
    });

    // Now that everything is defined above, we can instantiate a new collection
    // and fetch stored data from the persistent data store.
    var newspapers = new Newspapers;
    newspapers.fetch({
        success: function(newspapers) {
            if (!newspapers.length) {
                // If empty, initialize with seemingly-sensible defaults
                newspapers.reset([
                    {id: 'newspaper1', name: 'The Ann Arbor News', ads: ['ad2', 'ad4']},
                    {id: 'newspaper2', name: 'MLive', ads: ['ad1', 'ad3']},
                    {id: 'newspaper3', name: 'NPR', ads: ['ad2', 'ad3']}
                ]);
                newspapers.forEach(function(newspaper) {
                    newspaper.save();
                });
            }
        }
    });

    // Then we instantiate a new view with the above collection.
    new NewspaperList({ collection: newspapers });

    // Done with the newspaper part... on to the ads!

    // Define ad model and collection
    var Ad = Backbone.Model.extend({
        // Wrapper method for un/checking an ad
        check: function(check) {
            $('#' + this.id).prop('checked', check);
            return this;
        },

        // Determine if ad is checked
        isChecked: function() {
            return $('#' + this.id).prop('checked');
        },

        // Provide a way of highlighting the current ad
        highlight: function() {
            var $ad = $('#' + this.id);
            if ($ad.prop('checked')) {
                $ad.parents('li').css({ 'background-color': '#729fcf' });
            } else {
                $ad.parents('li').css({ 'background-color': '#fff' });
            }
            return this;
        }
    });
    var Ads = Backbone.Collection.extend({
        model: Ad,
        // Persist data locally
        localStorage: new Backbone.LocalStorage('ACME-Ads'),

        // Clear all ad highlights
        clearHighlights: function() {
            $('#ad-list .item').css({ 'background-color': '#fff' });
            return this;
        },

        // Uncheck all ads
        uncheckAll: function() {
            $('.ad-checkbox').prop('checked', false);
            return this;
        }
    });

    // Define ad view, not _that_ different from the newspaper one
    var AdList = Backbone.View.extend({
        // Provide some limited scope to the view
        el: $('#ads'),

        initialize: function() {
            // Render initially (since we're providing defaults)
            this.render();

            // Re-render list whenever new models are added to the Ad collection
            this.listenTo(this.collection, 'sync', this.render);

            // Start with disabled checkboxes
            $('input.ad-checkbox').prop('disabled', true);

            return this;
        },

        render: function() {
            // Load list-item template from `index.html`
            var template = _.template($('#ad-item').html()),
                newspaper = newspapers.get($('.newspaper-radio:checked').attr('id'));

            // Empty list before populating it from scratch. This is highly
            // inefficient and your browser will get slow once you start adding
            // several thousand ads.
            $('ul#ad-list').empty();
            this.collection.forEach(function(ad) {
                // Append list-item (from loaded template) to the unordered list
                $('ul#ad-list').append(template({ model: ad }));
                // Determine which ads should be checked
                ad.check(!!newspaper && _.contains(newspaper.get('ads'), ad.id));
                // Highlight checkd ads
                ad.highlight();
            });
            return this;
        },

        // Events that trigger function calls
        events: {
            'click #ad-add': 'addAd',
            'change input.ad-checkbox': 'selectAd'
        },

        // Triggered when adding a new ad
        addAd: function(event) {
            // Add a new Ad model to the Ads collection.
            var ad = new Ad({ text: $('#ad-text').val() });
            this.collection.add(ad);

            // Save to persistent storage
            ad.save();

            // We're still trying to be user-friendly, despite all else
            $('#ad-text').val('').focus();
        },

        // Triggered when (un)selecting an ad
        selectAd: function(event) {
            var $target = $(event.currentTarget),
                // Get currently-selected newspaper
                newspaper = newspapers.get($('.newspaper-radio:checked').attr('id')),
                ad = this.collection.get($target.attr('id'));

            ad.highlight();

            // Determine if ad will be added to or removed from the newspaper
            if (ad.isChecked()) {
                // Add ad unique ID to the newspaper ad array
                newspaper.set({ ads: _.union(newspaper.get('ads'), [ad.id]) });
            } else {
                // Remove ad unique ID from the newspaper ad array
                newspaper.set({ ads: _.without(newspaper.get('ads'), ad.id) });
            }

            // Save to persistent storage
            newspaper.save();
        }
    });

    // Now that everything is defined above, we can instantiate a new collection
    // and fetch stored data from the persistent data store.
    var ads = new Ads;
    ads.fetch({
        success: function(ads) {
            // If empty, initialize with seemingly-sensible defaults
            if (!ads.length) {
                ads.reset([
                    {id: 'ad1', text: 'Buy this brand-new Ford'},
                    {id: 'ad2', text: 'Click here for Michigan game tickets'},
                    {id: 'ad3', text: 'House for sale'},
                    {id: 'ad4', text: 'Some other fancy ad here...'}
                ]);
                ads.forEach(function(ad) {
                    ad.save();
                });
            }
        }
    });

    // Then we instantiate a new view with the above collection.
    new AdList({ collection: ads });
});
