/*global cloud:true*/
/*global __:true*/
/*global cs:true*/

/**
 * Class: Sessions
 * A simple tile to display all user that have active session (aka connected).
 */
$od.tiles.classes.Sessions = $od.tiles.classes.BasicTile.extend({

    init: function (config) {

        config = Object.merge(config, {
            type: 'Sessions',
            tmplName: '#sessions-tile'
        });

        this._super(config);

        // Templates for recto/verso. this is a flipping tile
        this.tmplRecto = $('#sessions-tile-recto').html();
        this.tmplSession = $('#sessions-item').html();

        this._sessions = [];
    },


    getLegend: function () {
        var txt = '';
        [cloud.USER_TYPES.CREW, cloud.USER_TYPES.PARTNER, cloud.USER_TYPES.CUSTOMER, cloud.USER_TYPES.DEMO].each(function (t) {
            txt += '<p><i class="fa {iconName} {cls}"></i> {type_name}</p>'.assign({
                iconName: cloud.getUserType(t).iconName,
                cls: cloud.getUserType(t).cls,
                type_name: cloud.getUserTypeName(t)
            });
        });

        return txt;
    },

    getContent: function () {
        var self = this;

        var list = '';
        // Sort sessions list by ending descending date of end.
        self._sessions = self._sessions.sortBy(function (rec) { return -rec.sessionbail; });
        self._sessions.each(function (rec, i) {
            list += self.tmplSession.assign(rec);
        });

        return self.tmpl.assign({
            panel: self.tmplRecto.assign({
                count: $od.tiles.lib.displayBadge(self._sessions.length),
                sessions: list
            })
        }).compact();
    },

    afterAdd: function () {
        var self = this;

        /*
         * Display help
         */
        self.getjQueryEl().on('click', '#sessions-tile-recto-help', function (ev) {
            ev.preventDefault();
            $(this).popover('toggle');
            $(this).toggleClass('selected');
        });
    },

    refresh: function (config) {
        var self = this;

        $.ajax({
            type: 'GET',
            url: '/sessionslist',
            dataType: 'json'
        })
        .done(function (data) {
            self._sessions = [];
            var ut;
            $.each(data, function (s, sess) {
                try {
                    ut = cloud.getUserType(sess.type);
                    self._sessions.push({
                        login: sess.login,
                        iconName: ut.iconName,
                        cls: ut.cls,
                        ipaddr: sess.ipaddr || '',
                        full_name: (sess.firstname + ' ' + sess.lastname).trim(),
                        sessionbail: new Date(sess.sessionbail).getTime(), // Convert to timestamp for sorting
                        bail: Date.create(sess.sessionbail).long()
                    });
                }
                catch (e) {}
            });
        })
        .fail(function () {})
        .always(function () {
            self.display(self.getContent());

            // Activate legend link
            self.getjQueryEl().find('#sessions-tile-recto-help').popover({
                html: true,
                placement: 'bottom',
                container: self.getjQueryEl(),
                trigger: 'manual',
                content: self.getLegend()
            });

            if (self.on.afterRefresh) {
                self.on.afterRefresh(self.getId());
            }
        });
    }
});

$od.tiles.register({
    tileClass: $od.tiles.classes.Sessions,
    className: 'Sessions',
    displayName: 'User sessions',
    faName: 'fa-users'
});
