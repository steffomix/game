/* 
 * Copyright (C) 20.11.16 Stefan Brinkmann <steffomix@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

define('interfaceApp', ['config', 'logger', 'gameSocket', 'gameRouter', 'i18n', 'backbone', 'underscore', 'jquery', 'util'],
    function (config, Logger, socket, router, i18n, Backbone, _, $, util) {

        var logger = Logger.getLogger('interfaceApp');
        logger.setLevel(config.logger.interfaceApp || 0);

        var $body = $('body'),
            templates = {},
            globalEvents = _.extend({}, Backbone.Events),
            accountEvents = _.extend({}, Backbone.Events),
            interfaceEvents = _.extend({}, Backbone.Events);

        _.templateSettings = {
            evaluate: /\{\{([\s\S]+?)\}\}/g,
            interpolate: /\{\{=([\s\S]+?)\}\}/g,
            escape: /\{\{-([\s\S]+?)\}\}/g
        };

        function render (data, templ) {
            data = data || this.viewData || {};
            templ = templ || this.template;

            try {
                this.$el.html(_.template(templ)(data));
            } catch (e) {
                this.$el.html('Render error: ' + e);
                logger.error('Render Error: ', e, data, templ);
            }
        }

        /**
         * Grab Template from Html Body
         * and store a copy, named by its html-id in templates
         */
        function grabTemplate(){
            var id = this.$el.attr('id'),
                html = this.$el.html();
            if(!id){
                logger.error('Template has no id: ', html);
            }
            this.template = templates[id] = html;
            this.$el.html('');
        }

        /**
         * Get a previous grabbed Template by its html id
         * @param id
         * @returns {*}
         */
        function getTemplate(id){
            if(templates[id]){
                return templates[id];
            }else{
                var msg = 'Template ' + id + ' not found.';
                logger.error(msg);
                return '<div>' + msg + '</div>';
            }
        }

        function hide(){
            this.$el.html('').hide();
        }

        function centerWindow(){
            this.util.centerWindowAsync(this.$body, this.$el);
        }

        function InterfaceApp () {
            this.getTemplate = getTemplate;
            this.$body = $body;
            this.centerWindow = centerWindow;
            this.hide = hide;
            this.grabTemplate = grabTemplate;
            this.translateKeys = i18n.translateKeys;
            this.render = render;
            this.socket = socket;
            this.router = router;
            this.globalEvents = globalEvents;
            this.interfaceEvents = interfaceEvents;
            this.accountEvents = accountEvents;
            this.translate = i18n.translate;
            this.util = util;

        }

        return InterfaceApp;
    });

