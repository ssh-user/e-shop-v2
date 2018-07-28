import * as nodemailer from "nodemailer";
import { config } from "../config";

let transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: true,
    auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.pass
    }
});



let mailOptions = {
    from: `"Интернет-магазин Подсолнух" ${config.mail.auth.user}`,
    to: 'web-1ekyw@mail-tester.com',
    subject: 'Ваш заказ ✔',
    html: "empty"
};


/**
 * 
 * @param user User. With email adress and discount
 * @param order Order. Array of products.
 * @param orderNumber Number. Number of order.
 */
export function sendMail(user, order, orderNumber: number) {
    return new Promise((resolve, reject) => {
        // change mail adress and send mail
        mailOptions.to = user.email;
        mailOptions.html = getMailTemplate(order, orderNumber);
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) reject(error);
            else resolve(info);
        });

    });
};

export function sendNewPasswordMail(user, password: string) {
    return new Promise((resolve, reject) => {
        // change mail adress and send mail
        mailOptions.subject = "Восстановление пароля Интернет-магазин Подсолнух"
        mailOptions.to = user.email;
        mailOptions.html = getMailTemplateForNewPassword(password, user.username);
        transporter.sendMail(mailOptions, (error, info) => {
            if (error)
                reject(error);
            else
                resolve(info);
        });

    });
};


function getMailTemplate(order, orderNumber): string {
    let mailHeader = `<p align="justify">Благодарим Вас за заказ! Номер вашего заказа <font color="#FF0000"><b>№ ${"00" + orderNumber}</b><font color="#000000">.</font></font></p>`;
    let mailTableHeader = `<table align="center" border="1" cellpadding="1" cellspacing="1">
            <thead>
                <tr>
                    <th scope="col">№</th>
                    <th scope="col">Название</th>
                    <th scope="col">Цена</th>
                    <th scope="col">Кол.</th>
                    <th scope="col">Сумма</th>
                </tr>
            </thead>`;
    let mailTableBody = `<tbody>`;
    let sum = 0;
    order.forEach((elem, index) => {
        let temp = `<tr>
			<td align="center">${ index + 1}</td>
			<td><a href="${config.server.domen}/item/${elem._id}"></a>${elem.name}</td>
			<td align="center">${ (elem.price).toFixed(2)} грн.</td>
			<td align="center">${ elem.count} шт.</td>
			<td align="center">${ (elem.price * elem.count).toFixed(2)} грн.</td>
		</tr>`;
        mailTableBody += temp;
        sum += elem.price * elem.count;
    });
    mailTableBody += `
        <tr>
            <td colspan=3 align="center">Итого</td>
            <td colspan=2 align="center">${(sum).toFixed(2)} грн.</td>
        </tr>`;
    mailTableBody += `</tbody></table>`;

    let template = mailHeader + mailTableHeader + mailTableBody;
    return template;
};

function getMailTemplateForNewPassword(password: string, username: string): string {
    let template = `<p>Было запрошено восстановление пароля от Вашего аккаунта.</p>
                    <p>Ваш логин: <span style="color:red;font-size:26px;">${username}</span></p>
                    <p>Ваш новый пароль: <span style="color:red;font-size:26px;">${password}</span></p>
                    <p>Вы можете изменить пароль Вашем профиле на сайте.</p>`;

    return template;
};