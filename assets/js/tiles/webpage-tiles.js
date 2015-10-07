/*global cloud:true*/
/*global __:true*/
/*global $OD:true*/

/**
 * Class: Webpage
 * A tile to display a webpage.
 */
$OD.tiles.classes.WebpageSentry = $OD.tiles.classes.BasicTile.extend({

  init: function (config) {

    config = $.extend(config, {
      type: 'WebpageSentry',
      tmplName: '#webpage-sentry-tile'
    });

    this._super(config);

    // Templates for recto/verso. this is a flipping tile
    this.recto = $('#webpage-sentry-tile-recto').html();
    this.verso = $('#webpage-sentry-tile-verso').html();
    this.cfg.webpage_name = this.cfg.webpage_name || __('Google');
    this.cfg.webpage_url = this.cfg.webpage_url || 'http://www.google.fr';
    this.cfg.webpage_action = this.cfg.webpage_action ? this.cfg.webpage_action : 'thumbnail';
    this.cfg.webpage_refresh = this.cfg.webpage_refresh ? this.cfg.webpage_refresh.toNumber() : 60;
  },

  getRefreshDelay: function () {
    return this.cfg.webpage_refresh * 60; // in seconds
  },

  getContent: function () {
    var self = this;

    var content;

    switch (self.cfg.webpage_action) {
    case 'thumbnail':
      // URL for a website
      content = cloud.assign(self.tmpl, {
        panel: cloud.assign(self.recto, {
          id: self.getId(),
          webpage_name: self.cfg.webpage_name || __('Web Page'),
          delay: self._delay,
          webpage: self._imgSrc ? cloud.assign($('#webpage-sentry-thumbnail').html, {
              id: self.getId(),
              webpage_url: self.cfg.webpage_url,
              webpage_img: self._imgSrc,
              webpage_msg: self._msg || ''
            }) : cloud.assign($('#webpage-sentry-thumbnail').html, {
              webpage_url: self.cfg.webpage_url
            })
        })
      });
      break;

    case 'centreon':
      // URL for a graph from Centreon
      content = cloud.assign(self.tmpl, {
        panel: cloud.assign(self.recto, {
          id: self.getId(),
          webpage_name: self.cfg.webpage_name || __('Web Page'),
          delay: self._delay,
          webpage: cloud.assign($('#webpage-sentry-page').html, {
              id: self.getId(),
              webpage_url: self.cfg.webpage_url,
              webpage_img: self._imgSrc,
              webpage_msg: self._msg || ''
            })
        })
      });
      break;

    default:
      // URL for an image (png, gif, jpeg, etc.)
      content = cloud.assign(self.tmpl, {
      panel: cloud.assign(self.recto, {
        id: self.getId(),
        webpage_name: self.cfg.webpage_name || __('Web Page'),
        delay: self._delay,
        webpage: cloud.assign($('#webpage-sentry-thumbnail').html, {
            id: self.getId(),
            webpage_url: self.cfg.webpage_url,
            webpage_img: self.cfg.webpage_url,
            webpage_msg: self._msg || ''
          })
        })
      });
      break;
    }

    cloud.loader.removeAll(self.getjQueryEl());

    return content;
  },

  redraw: function () {
    var self = this;

    self.display(self.getContent());

    // Normalize width and height if we display an image
    if (self.cfg.webpage_action === 'img' || self.cfg.webpage_action === 'centreon') {
      $('#' + self.getId() + '-webpage').height(
        $('#'+self.id).height() - $('#webpage-sentry-title').height() - 8
      );
      $('#' + self.getId() + '-webpage').width(
        $('#'+self.id).width() - 8
      );
    }

    if (self.on.afterRefresh) {
      self.on.afterRefresh(self.getId());
    }
  },

  refresh: function (config) {
    var self = this;

    cloud.loader.startInto(self.getjQueryEl().find('#webpage-sentry-title'));

    switch (self.cfg.webpage_action) {
    case 'thumbnail':
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: '/makethumb',
        data: {
          _csrf: $OD.CSRF_TOKEN,
          url: encodeURI(self.cfg.webpage_url),
          width: self.getSizeX() * 260,
          height: self.getSizeY() * 220
        },
        success: function (json) {
          self._imgSrc = json.imgSrc || '/images/brand.png';
          self._delay = json.msDelay || 0;
          self._msg = json.msg || '';
        },
        error: function(jqhxr, errorText, errorThrown) {
          self._imgSrc = null;
        },
        complete: function () {
          self.redraw();
        }
      });
      break;

    case 'centreon':
      $.ajax({
        url: '/centreoncapture',
        type: 'POST',
        data: {
          _csrf: $OD.CSRF_TOKEN,
          url: encodeURI(self.cfg.webpage_url)
        }
      })
      .done(function (imgpath) {
        self._imgSrc = imgpath || '/images/brand.png';
      })
      .fail(function () {
        self._imgSrc = '/images/not_found.png';
      })
      .always(function () {
        self.redraw();
      });
      break;

    default:
      self.redraw();
      break;
    }
  },

  afterAdd: function () {
    var self = this;

    /*
     * Display setup tile
     */
    self.getjQueryEl().on('click', 'div.header #webpage-sentry-tile-recto-setup-button', function (ev) {
      ev.preventDefault();

      self.allowRefresh = false; // Do not allow refresh
      cloud.loader.removeAll(self.getjQueryEl());
      self.getjQueryEl().find('.flipbox').flippy({
        depth: 2.0,
        verso: cloud.assign(self.verso, { id: self.getId() }),
        direction: 'left',
        duration: cloud.FLIP_DURATION,
        onFinish: function () {
          // Restore setup properties when animation start to display setup panel (aka verso)
          $('#' + self.getId() + ' input#webpage_name').val(self.cfg.webpage_name);
          $('#' + self.getId() + ' input#webpage_url').val(self.cfg.webpage_url);
          cloud.select.set('#' + self.getId() + ' select#webpage_action', 'action', self.cfg.webpage_action);
          cloud.select.set('#' + self.getId() + ' select#webpage_refresh', 'delay_min', self.cfg.webpage_refresh);
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
    self.getjQueryEl().on('click', '#webpage-sentry-tile-verso-done-button', function (ev) {
      ev.preventDefault();
      self.cfg.webpage_name = $('#' + self.getId() + ' input#webpage_name').val();
      self.cfg.webpage_url = $('#' + self.getId() + ' input#webpage_url').val();
      self.cfg.webpage_action = cloud.select.get('#' + self.getId() + ' select#webpage_action', 'action');
      self.cfg.webpage_refresh = cloud.select.get('#' + self.getId() + ' select#webpage_refresh', 'delay_min');
      self.on.save();
      self.getjQueryEl().find('.flipbox').flippyReverse();
      self.allowRefresh = true; // A refresh
    });
  }
});

$OD.tiles.register({
  tileClass: $OD.tiles.classes.WebpageSentry,
  className: 'WebpageSentry',
  displayName: 'Web page sentry',
  faName: 'fa-eye'
});
