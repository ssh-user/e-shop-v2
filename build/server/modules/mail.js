"use strict";function sendMail(t,n,e){return new Promise(function(o,i){mailOptions.to=t.email,mailOptions.html=getMailTemplate(n,e),transporter.sendMail(mailOptions,function(t,n){t?i(t):o(n)})})}function sendNewPasswordMail(t,n){return new Promise(function(e,o){mailOptions.subject="Восстановление пароля Интернет-магазин Подсолнух",mailOptions.to=t.email,mailOptions.html=getMailTemplateForNewPassword(n,t.username),transporter.sendMail(mailOptions,function(t,n){t?o(t):e(n)})})}function getMailTemplate(t,n){var e='<p align="justify">Благодарим Вас за заказ! Номер вашего заказа <font color="#FF0000"><b>№ 00'+n+'</b><font color="#000000">.</font></font></p>',o="<tbody>",i=0;return t.forEach(function(t,n){var e='<tr>\n\t\t\t<td align="center">'+(n+1)+'</td>\n\t\t\t<td><a href="'+config_1.config.server.domen+"/item/"+t._id+'"></a>'+t.name+'</td>\n\t\t\t<td align="center">'+t.price.toFixed(2)+' грн.</td>\n\t\t\t<td align="center">'+t.count+' шт.</td>\n\t\t\t<td align="center">'+(t.price*t.count).toFixed(2)+" грн.</td>\n\t\t</tr>";o+=e,i+=t.price*t.count}),o+='\n        <tr>\n            <td colspan=3 align="center">Итого</td>\n            <td colspan=2 align="center">'+i.toFixed(2)+" грн.</td>\n        </tr>",o+="</tbody></table>",e+'<table align="center" border="1" cellpadding="1" cellspacing="1">\n            <thead>\n                <tr>\n                    <th scope="col">№</th>\n                    <th scope="col">Название</th>\n                    <th scope="col">Цена</th>\n                    <th scope="col">Кол.</th>\n                    <th scope="col">Сумма</th>\n                </tr>\n            </thead>'+o}function getMailTemplateForNewPassword(t,n){return'<p>Было запрошено восстановление пароля от Вашего аккаунта.</p>\n                    <p>Ваш логин: <span style="color:red;font-size:26px;">'+n+'</span></p>\n                    <p>Ваш новый пароль: <span style="color:red;font-size:26px;">'+t+"</span></p>\n                    <p>Вы можете изменить пароль Вашем профиле на сайте.</p>"}exports.__esModule=!0;var nodemailer=require("nodemailer"),config_1=require("../config"),transporter=nodemailer.createTransport({host:config_1.config.mail.host,port:config_1.config.mail.port,secure:!0,auth:{user:config_1.config.mail.auth.user,pass:config_1.config.mail.auth.pass}}),mailOptions={from:'"Интернет-магазин Подсолнух" '+config_1.config.mail.auth.user,to:"web-1ekyw@mail-tester.com",subject:"Ваш заказ ✔",html:"empty"};exports.sendMail=sendMail,exports.sendNewPasswordMail=sendNewPasswordMail;