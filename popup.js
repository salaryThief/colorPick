const localFile = document.getElementById("local");
const getColor = document.getElementById("getColor");
const tabs = document.getElementById("tab");
const elements = document.querySelectorAll("#tab li");
const bgList = document.getElementById("bgList");
const canvas = document.getElementById("canvas");

const functionElement = [
    document.getElementById("fileRead"),
    document.getElementById("backGroundRead"),
];


localFile.addEventListener("change", () => {
    const file = localFile.files[0];
    const reader = new FileReader();
    let src;
    reader.addEventListener("load", ev => {
        src = ev.target.result;
        if (src) {
            backgroundrequest(src);
        }

    });
    function backgroundrequest(param) {
        chrome.runtime.sendMessage({ displayName: "popup", fileName: file.name, src: param }, function (response) {
            console.log(`message from background: ${JSON.stringify(response)}`);
        });
    }
    reader.readAsDataURL(file);
});

tabs.addEventListener("click", (elm) => {
    if (elm.target === tabs) {
        return;
    }

    if (elm.target.classList.contains("current")) {
        return;
    }
    Array.from(tabs.children).forEach((child) => {
        child.lastElementChild.classList.remove("current");
    });
    elm.target.classList.add("current");

    changeFunction(Array.from(elements).indexOf(elm.target.parentNode));
});

function changeFunction(index) {
    functionElement.forEach((o, i) => {
        o.classList.add('none');
        if (i === index) {
            o.classList.remove('none');
        }
    })
};
{
    chrome.tabs.executeScript({
        code: '(' + getallBgimages + ')();' //argument here is a string but function.toString() returns function's code
    }, (results) => {
        results[0].forEach((elm, i) => {
            const li = document.createElement('li')
            const a = document.createElement('a');
            li.appendChild(a);
            a.setAttribute('href', '#');
            a.addEventListener('mouseover', () => {
                canvas.style.backgroundImage = `url(${elm})`;
            });
            a.addEventListener('mouseout', () => {
                canvas.style.backgroundImage = '';
            });

            a.addEventListener('click', () => {
                chrome.runtime.sendMessage({ displayName: "popup", fileName: elm, src: elm }, function (response) {
                    console.log(`message from background: ${JSON.stringify(response)}`);
                });
            })
            a.innerHTML = `bgImg:${i}`;
            bgList.appendChild(li);
        });
    });
    function getallBgimages() {
        var url, B = [], A = document.getElementsByTagName('*');

        function deepCss(who, css) {
            if (!who || !who.style) return '';
            var sty = css.replace(/\-([a-z])/g, function (a, b) {
                return b.toUpperCase();
            });
            if (who.currentStyle) {
                return who.style[sty] || who.currentStyle[sty] || '';
            }
            var dv = document.defaultView || window;
            return who.style[sty] || dv.getComputedStyle(who, "").getPropertyValue(css) || '';
        }

        A = B.slice.call(A, 0, A.length);
        while (A.length) {
            url = deepCss(A.shift(), 'background-image');
            if (url) url = /url\(['"]?([^")]+)/.exec(url) || [];
            url = url[1];
            if (url && B.indexOf(url) == -1) B[B.length] = url;
        }
        return B;
    }

}