import { seriesLoadScripts, loadLinks, $$ } from '../../utils/util';
import { getPrintPages, RangeIsNoEmpty, getPrintPageHtml } from '../../global/api';
import { jsPDF } from "jspdf";
window.jsPDF = jsPDF;
import html2canvas from 'html2canvas';
window.html2canvas = html2canvas;

import tooltip from '../../global/tooltip';


// Dynamically load dependent scripts and styles
const dependScripts = [
    'expendPlugins/print/fonts/WeiRuanYaHei/font.js',
    'http://localhost:8080/luckysheetPluginPrint.umd.js',
];

const dependLinks = [
    // 'expendPlugins/chart/chartmix.css',
    'http://localhost:8080/luckysheetPluginPrint.css',
];

// Initialize the chart component
function print(data, isDemo) {
    loadLinks(dependLinks);

    seriesLoadScripts(dependScripts, null, function () {
        
    });
}

function renderPdf(html){
    const pdf = new jsPDF('p', 'pt', 'a4', false);
    const h=pdf.getPageHeight()+30;
    const w=pdf.getPageWidth();
    pdf.html(html || document.body, {
        callback: function (pdf) {
            tooltip.screenshot('', '<div><iframe id="sheet-confirm-print-save" style="border: 0;width:' + w + 'px;height:' + h+ 'px;overflow:auto;" /></div>',null,' ');
            $('#sheet-confirm-print-save').attr('src', pdf.output('datauristring'));
        }
    });
}

async function printPage() {
    const pdf = new jsPDF('p', 'pt', 'a4', false);
    const h=pdf.getPageHeight()+30;
    const w=pdf.getPageWidth();

    let p=1;
    const page=getPrintPages();
    for(let i=1;i<=page;i++){
        const pageHtml=getPrintPageHtml(i);
        if(!!pageHtml){
            console.log(p,pageHtml)
            if(p>1){
               pdf.addPage();
            }
            //pdf.setPage(p); 
            await pdf.html(pageHtml);
            p++;
        }
    }
    
    tooltip.screenshot('', '<iframe id="sheet-confirm-print-save" style="border: 0;width:' + w + 'px;height:' + h+ 'px;overflow:auto;" />',null,' ');
    //$('#sheet-confirm-print-save').attr('src', pdf.output('datauristring'));

    setTimeout(function() {

        //Save PDF Doc	
        ///pdf.save("HTML-Document.pdf");

        //Generate BLOB object
        var blob = pdf.output("blob");

        //Getting URL of blob object
        var blobURL = URL.createObjectURL(blob);

        //Showing PDF generated in iFrame element
        var iframe = document.getElementById('sheet-confirm-print-save');
        iframe.src = blobURL;
    }, 1000);
}



export { print,renderPdf,printPage }
