import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    let logs = [];
    try {
        console.log("Iniciando Headless Chrome...");
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = `CRASH DO BROWSER: ${msg.text()}`;
                console.log(text);
                logs.push(text);
            } else {
                const text = `BROWSER LOG: ${msg.text()}`;
                console.log(text);
                logs.push(text);
            }
        });

        page.on('pageerror', err => {
            const text = `ERRO NÃO TRATADO: ${err.toString()}`;
            console.log(text);
            logs.push(text);
        });

        console.log("Visitando a versão compilada em http://localhost:4173");
        await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => {
            console.log(e.message);
            logs.push(e.message);
        });

        await new Promise(r => setTimeout(r, 2000));
        await browser.close();
        console.log("Inspeção Concluída");
    } catch (e) {
        console.error("Puppeteer Error:", e);
        logs.push(`Puppeteer Error: ${e.message}`);
    } finally {
        fs.writeFileSync('puppeteer-logs.txt', logs.join('\n'));
    }
})();
