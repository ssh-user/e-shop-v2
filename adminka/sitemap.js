const mongo = require('./mongo');
const fs_async = require("./promisify");
const OPTIONS = require("./options");
const path = require('path');





// create a sitemap
async function sitemap() {
    try {
        let portals = await mongo.getAllPortals();
        let categories = await mongo.getAllCategories();
        let products = await mongo.getALLProducts();

        let sitemap = ``;

        sitemap += await getHeadOfTemplate();
        sitemap += await getPortalTemlate(portals);
        sitemap += await getCategoryTemlate(categories);
        sitemap += await getProductTemlate(products);
        sitemap += await getEndOfTemplate();

        // get path and save file
        let path_to_site_core = path.join(OPTIONS.path_to_pub, "../");
        await fs_async.writeFile(path_to_site_core + "sitemap.xml", sitemap);

    } catch (error) {
        console.log(error);
    };
};

module.exports.create = sitemap;



function getHeadOfTemplate() {
    return new Promise((resolve, reject) => {
        try {
            // create a head of XML file with static info
            let templateHead = `<?xml version="1.0" encoding="UTF-8"?>
                <urlset 
                    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" > 
                <url>
                    <loc>${OPTIONS.server.domenHLvl}</loc>
                    <image:image>
                        <image:loc>${OPTIONS.server.domenHLvl}logo.png</image:loc>
                        <image:caption>${encodeURIComponent("Интернет магазин Подсолнух")}</image:caption>
                    </image:image>
                    <changefreq>weekly</changefreq>
                    <priority>1.0</priority>
                </url>
                <url>
                    <loc>${OPTIONS.server.domenHLvl}contact</loc>
                    <changefreq>weekly</changefreq>
                    <priority>0.8</priority>
                </url>
                <url>
                    <loc>${OPTIONS.server.domenHLvl}about</loc>
                    <changefreq>weekly</changefreq>
                    <priority>0.8</priority>
                </url>
                <url>
                    <loc>${OPTIONS.server.domenHLvl}delivery</loc>
                    <changefreq>weekly</changefreq>
                    <priority>0.8</priority>
                </url>
                `;
            resolve(templateHead);
        } catch (error) {
            reject(error);
        };
    });
};

function getPortalTemlate(arr) {
    return new Promise((resolve, reject) => {
        try {
            let templateOfPortal = ``;
            for (let elem of arr) {
                let temp = `<url>
                    <loc>${OPTIONS.server.domenHLvl}portal/${elem._id}</loc>
                    <lastmod>${elem.siteMapDate || new Date().toISOString()}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.9</priority>
                </url>
                `;

                templateOfPortal += temp;
            };

            resolve(templateOfPortal);
        } catch (error) {
            reject(error);
        };
    });
};

function getCategoryTemlate(arr) {
    return new Promise((resolve, reject) => {
        try {
            let templateOfCategory = ``;
            for (let elem of arr) {
                let template = `<url>
                    <loc>${OPTIONS.server.domenHLvl}catalog/${elem._id}</loc>
                    <lastmod>${elem.siteMapDate || new Date().toISOString()}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.7</priority>
                </url>
                `;
                templateOfCategory += template;
            };

            resolve(templateOfCategory);
        } catch (error) {
            reject(error);
        };
    });
};

function getProductTemlate(arr) {
    return new Promise((resolve, reject) => {
        try {
            let templateOfProduct = ``;
            for (let elem of arr) {
                let template = `<url>
                    <loc>${OPTIONS.server.domenHLvl}item/${elem._id}</loc>
                    <image:image>
                        <image:loc>${OPTIONS.server.domenHLvl}images/${elem.image[0]}</image:loc>
                        <image:caption>${encodeURIComponent(elem.name)}</image:caption>
                    </image:image>
                    <lastmod>${elem.siteMapDate || new Date().toISOString()}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.5</priority>
                </url>
                `;

                templateOfProduct += template;
            };

            resolve(templateOfProduct);
        } catch (error) {
            reject(error);
        };
    });
};

function getEndOfTemplate() {
    return new Promise((resolve, reject) => {
        try {
            // close tag of sitemap
            let templateEnd = `</urlset>`;

            resolve(templateEnd);
        } catch (error) {
            reject(error);
        };
    });
};