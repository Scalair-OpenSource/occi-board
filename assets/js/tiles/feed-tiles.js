/*global cloud:true*/
/*global __:true*/
/*global cs:true*/

/**
 * Class: Feed
 * A simple tile to display RSS feed.
 */
$OD.tiles.classes.Feed = $OD.tiles.classes.BasicTile.extend({

  init: function (config) {

    config = Object.merge(config, {
      type: 'Feed',
      tmplName: '#feed-tile'
    });

    this._super(config);

    // Templates for recto/verso. this is a flipping tile
    this.recto = $('#feed-tile-recto').html();
    this.verso = $('#feed-tile-verso').html();
    this.MIN_FEEDS_LOAD = 4;
    this.MAX_FEEDS_LOAD = 32;
    //~ this.cfg.rss_url = this.cfg.rss_url || 'http://www.certa.ssi.gouv.fr/site/certa_alerte.rss';
    this.cfg.rss_url = this.cfg.rss_url || 'http://www.cert.ssi.gouv.fr/site/cert-fr.rss';
    this.cfg.rss_num = this.cfg.rss_num ? this.cfg.rss_num.toNumber() : 8;
    this.cfg.rss_refresh = this.cfg.rss_refresh ? this.cfg.rss_refresh.toNumber() : 60;
  },

  /*
   * Get JSON from feed with help of Google API and create items in Feed tile
   */
  parseRSS: function(url, callback) {
    var self = this;
    $.ajax({
      url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(url),
      dataType: 'json',
      success: function(data) {
        /* Feed attributes example:
         * author: ""
         * description: "CERTA (Centre d'Expertise gouvernemental de Reponse et de Traitement des Attaques informatiques)."
         * entries: Array[3]
         * feedUrl: "http://www.certa.ssi.gouv.fr/site/certa_alerte.rss"
         * link: "http://www.certa.ssi.gouv.fr"
         * title: "Les alertes en cours du CERTA."
         * type: "rss20"
         */
        if (data && data.responseData && data.responseData.feed) {
          self.rss_title = data.responseData.feed.title;
          self.rss_link = data.responseData.feed.link;
          self.rss_desc = data.responseData.feed.description;
          callback.call(self, data.responseData.feed);
        }
        else {
          callback.call(self, {});
        }
      }
    });
  },

  writeRSS: function (feed) {
    var self = this;

    if (feed.entries) {
      /* Feed entry example:
       * author: ""
       * categories: Array[0]
       * content: "Une vulnérabilité a été découverte dans un composant graphique de Microsoft. Elle permet à un attaquant de provoquer une exécution de code arbitraire à distance au moyen d'un fichier embarquant une image au format TIFF spécialement conçue. Ce fichier peut être intégré dans un document Microsoft Office, une page Web ou un message electronique."
       * contentSnippet: "Une vulnérabilité a été découverte dans un composant graphique de Microsoft. Elle permet à un attaquant de provoquer une ..."
       * link: "http://www.certa.ssi.gouv.fr/site/CERTA-2013-ALE-007/CERTA-2013-ALE-007.html"
       * publishedDate: ""
       * title: "CERTA-2013-ALE-007 : Vulnérabilité dans un composant graphique de Microsoft (06 novembre 2013)"
       */
      var templ = '<li><a href="{link}" target="_feed" rel="tooltip" title="{content}">{title} : {contentSnippet}</a></li>';
      var list ='';
      var n = 0;
      $('#feed-' + self.getId()).empty();
      feed.entries.each(function (item) {
        if (self.cfg.rss_num === 0 || n < self.cfg.rss_num) {
          list += templ.assign(item);
        }
        n++;
      });
      $('#feed-' + self.getId()).append('<ul>' + list + '</ul>');

      cloud.attachTooltips(self.getjQueryEl());
    }
  },

  getRefreshDelay: function () {
    return this.cfg.rss_refresh * 60; // in seconds
  },

  getContent: function () {
    var self = this;

    return self.tmpl.assign({
      panel: self.recto.assign({
        id: 'feed-' + self.getId(),
        rss_num: self.cfg.rss_num,
        rss_url: self.cfg.rss_url,
        rss_title: self.rss_title || __('Feed'),
        rss_desc: self.rss_desc || '',
        rss_link: self.rss_link || ''
      })
    }).trim();
  },

  refresh: function (config) {
    var self = this;
    self.parseRSS(self.cfg.rss_url, function (feed) {

      self.display(self.getContent());

      self.writeRSS(feed);
      if (self.on.afterRefresh) {
        self.on.afterRefresh(self.getId());
      }
    });
  },

  afterAdd: function () {
    var self = this;

    /*
     * Display setup tile
     */
    self.getjQueryEl().on('click', 'div.header #feed-tile-recto-setup-button', function (ev) {

      self.allowRefresh = false; // Do not allow refresh

      ev.preventDefault();
      self.getjQueryEl().find('.flipbox').flippy({
        verso: self.verso,
        direction: 'left',
        noCSS: false,
        duration: cloud.FLIP_DURATION,
        onFinish: function () {
          // Restore setup properties when animation start to display setup panel (aka verso)
          $('#' + self.getId() + ' input#feed_url').val(self.cfg.rss_url);

          self.rss_num_slider = self.getjQueryEl().find('input#feed_num').slider({
            min: self.MIN_FEEDS_LOAD,
            max: self.MAX_FEEDS_LOAD,
            tooltip: 'always'
          });

          if (self.cfg.rss_num > self.MAX_FEEDS_LOAD) {
            self.cfg.rss_num = self.MAX_FEEDS_LOAD;
          }
          if (self.cfg.rss_num < self.MIN_FEEDS_LOAD) {
            self.cfg.rss_num = self.MIN_FEEDS_LOAD;
          }
          self.rss_num_slider.slider('setValue', self.cfg.rss_num);

          cloud.select.set('#' + self.getId() + ' select#feed_refresh', 'delay_min', self.cfg.rss_refresh);
        },
        onReverseFinish: function () {
          // Setup is done, apply it!
          self.refresh();
        }
      });
    });

    /*
     * Setup is done
     */
    self.getjQueryEl().on('click', '#feed-tile-verso-done-button', function (ev) {
      ev.preventDefault();
      self.cfg.rss_url = $('#' + self.getId() + ' input#feed_url').val();
      self.cfg.rss_num = self.rss_num_slider.slider('getValue');
      self.cfg.rss_refresh = cloud.select.get('#' + self.getId() + ' select#feed_refresh', 'delay_min');
      self.on.save();
      self.getjQueryEl().find('.flipbox').flippyReverse();
      self.allowRefresh = true; // A refresh
    });
  }
});

$OD.tiles.register({
  tileClass: $OD.tiles.classes.Feed,
  className: 'Feed',
  displayName: 'RSS Feed',
  faName: 'fa-rss'
});
