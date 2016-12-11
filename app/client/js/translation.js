/* 
 * Copyright (C) 01.12.16 Stefan Brinkmann <steffomix@gmail.com>
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


define('translation', [], function () {

    /**
     * format: '<module>.<templateKey>': 'translation {{= dataKey }}
     */
    return {
        en: {
            'connect.connect': 'Connect',
            'connect.host': 'Host',
            'connect.port': 'Port',
            'connect.dataIncomplete': 'Connect Data incomplete',
            'connect.fail': 'Connection failed. Please check your Data.',

            'login.login': 'Login',
            'login.register': 'Register',
            'login.username': 'Username',
            'login.password': 'Password',
            'login.passwords not same': 'Passwords must be same',
            'login.loginDataIncomplete': 'Login Data incomplete.',
            'login.registerDataIncomplete': 'Registration Data incomplete.',
            'login.login failed': 'Login failed. Please check your Data.',
            'login.register failed': 'Registration failed. Please check your Data.',
            'login.login success': 'Login success',
            'login.register success': 'Registration success',


            'chat.chat': 'Chat',
            'chat.context_userLogin': 'Player {{=user }} enter Game.',
            'chat.context_userDisconnect': 'Player {{=user }} disconnected.',

            'topnav.logout': 'Logout'
        },
        de: {}
    };
})