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


define('i18n', ['config', 'logger', 'underscore'], function (config, Logger, _) {

    var instance,
        logger = Logger.getLogger('i18n');
    logger.setLevel(config.logger.i18n || 0);

    return getInstance();

    function getInstance () {
        if ( !instance ) {
            instance = new I18n();
        }
        return instance;
    }

    function I18n () {
        var lang = 'en',
            defaultLang = 'en',
            translations = {
                en: {

                },
                de: {

                }
            };

        /**
         * Set current used translation
         * @param l {string} translation key, defaults to 'en'
         */
        this.setLang = function(l){
            if(!translations[l]){
                logger.warn('I18n Lang "' + l + '" does not exist. Use default: ' + defaultLang);
            }else{
                lang = l;
            }
        };

        /**
         *
         * @returns {string} current set lang
         */
        this.getLang = function(){
            return lang;
        }

        /**
         * Uses underscore.template for data insert
         * @param key {string}
         * @param data {object}
         */
        this.translate = function(key, data){
            var trans;
            try{
                if (data){
                    trans = _.template(translations[lang][key], data);
                }else{
                    trans = translations[lang][key];
                }
                return trans;
            }catch(e){
                logger.error('I18n key "' + key + '" throw error: ' + e, data);
                return key;
            }
        }
    }
});
