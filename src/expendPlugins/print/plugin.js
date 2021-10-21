import { seriesLoadScripts, loadLinks, $$ } from '../../utils/util';
import { getPrintPages,RangeIsNoEmpty } from '../../global/api';
import menuButton from '../../controllers/menuButton';
import tooltip from '../../global/tooltip';
import Store from '../../store';

import { jsPDF } from "jspdf";
window.jsPDF = jsPDF;
import html2canvas from 'html2canvas';
window.html2canvas = html2canvas;


// Dynamically load dependent scripts and styles
const dependScripts = [
    'assets/fonts/WeiRuanYaHei/font.js',
];

const dependLinks = [
    'expendPlugins/print/style.css',
];

// Initialize the chart component
function print(data, isDemo) {
    loadLinks(dependLinks);

    seriesLoadScripts(dependScripts, null, function () {
        
    });
}

async function renderPdf(imgs) {
    const pdf = new jsPDF('p', 'pt', 'a4', false);
    const padding = 10;
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    if(imgs && imgs.length>0){
        imgs.forEach((img,i)=> {
            const imgProps= pdf.getImageProperties(img);
            let imgWidth = imgProps.width;
            let imgHeight = imgProps.height;
            if(imgWidth>pdfWidth-(2*padding)){
                imgWidth=pdfWidth-(2*padding);
                imgHeight = (imgProps.height/imgProps.width) * imgWidth;
            }
            if(imgHeight>pdfHeight-(2*padding)){
                imgHeight=pdfHeight-(2*padding);
                imgWidth=(imgProps.width/imgProps.height) * imgHeight;
            }
            pdf.addImage(img, 'PNG', 10, 10, imgWidth, imgHeight);
            if(imgs.length>1 && i<imgs.length-1){
                pdf.addPage();
            }
        });
        let timer=setInterval(function() {
            //let pdfUrl = pdf.output('datauristring');// 预览内容过大出现空白页
            var pdfBlob = pdf.output("blob");
            if(pdfBlob){
                var pdfUrl = URL.createObjectURL(pdfBlob);
                clearInterval(timer);
                timer=null;
                
                const printFrame = document.createElement('iframe');
                document.body.appendChild(printFrame);
            
                printFrame.style.display = 'none';
                printFrame.onload = function() {
                    var printWindow = printFrame.contentWindow;
                    if (!printWindow) {
                        throw new Error('Could not get content window');
                    }
                    if (printWindow.matchMedia) {
                        printWindow.matchMedia('print').addListener((media) => {
                            console.log('print event',media);
                            
                            // if (media.matches) {
                            //     //beforePrint();
                            // } else {
                            //     //afterPrint();
                            //     //document.body.removeChild(printFrame);
                            // }
                        });
                    } else {
                        //onbeforeprint
                        printWindow.onafterprint = function () {
                            printFrame.parentNode.removeChild(printFrame); 
                        }
                    }
                    setTimeout(function() {
                        printWindow.focus();
                        printWindow.print();
                    }, 1);
                };
                printFrame.src = pdfUrl;
            }
        },500);
    }
}

function printRange() {
    const showGridLines=Store.showGridLines;
    Store.showGridLines=false;
    let {url,image} = menuButton.rangeScreenshot();
    Store.showGridLines=showGridLines;

    if(url && image){
        renderPdf([image]);
    }
}

function printPage(page=1) {
    const showGridLines=Store.showGridLines;
    Store.showGridLines=false;
    
    if(!page || page<1) page=1;
    if(page>Store.pageRange.length) page=Store.pageRange.length;

    const range=Store.pageRange[page-1];
    const {url,image}=menuButton.rangeScreenshot({...range});

    Store.showGridLines=showGridLines;
    
    if(url && image){
        renderPdf([image]);
    }
}

/**
 * 
 */
function printPages() {
    const pages=getPrintPages();
    setTimeout(function() {
        let imgs=[];

        const showGridLines=Store.showGridLines;
        Store.showGridLines=false;
        for(let i=0;i<pages;i++){
            const range=Store.pageRange[i];
            if(i===0){
                const {url,image}=menuButton.rangeScreenshot({...range});
                
                if(url && image){
                    imgs.push(image);
                }
            }else{
                const oo=RangeIsNoEmpty({range});
                if(oo===true){
                    const {url,image}=menuButton.rangeScreenshot({...range});
                    
                    if(url && image){
                        imgs.push(image);
                    }
                }
            }
        }
        Store.showGridLines=showGridLines;
        renderPdf(imgs);
    },0)
}

export { print,printRange,printPage,printPages }
