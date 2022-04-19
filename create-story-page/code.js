// This plugin will open a modal to prompt the user to enter a branch url, title, and author, and
// it will then create a new branch page
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 400 });
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    const colorBgDark = { r: 209 / 255, g: 209 / 255, b: 209 / 255 };
    const colorInkBase = { r: 57 / 255, g: 56 / 255, b: 56 / 255 };
    const colorInkLight = { r: 112 / 255, g: 112 / 255, b: 112 / 255 };
    if (msg.type === 'create-branch-page') {
        // create a new page with the generated branch name
        const newPage = figma.createPage();
        newPage.name = `${msg.cardNumber} ${msg.branchTitle}`;
        figma.currentPage = newPage;
        const nodes = [];
        // create new title frame to put the text into
        const titleFrame = figma.createFrame();
        titleFrame.fills = [{ type: 'SOLID', color: colorBgDark }];
        titleFrame.name = "Branch Information";
        titleFrame.layoutMode = "VERTICAL";
        titleFrame.counterAxisSizingMode = "AUTO";
        titleFrame.horizontalPadding = 128;
        titleFrame.verticalPadding = 128;
        titleFrame.itemSpacing = 48;
        titleFrame.cornerRadius = 24;
        figma.currentPage.appendChild(titleFrame);
        // check that Roboto is available, if not, use Helvetica, if Helvetica isn't available, use the first font available
        const checkForFonts = (fontList) => {
            return fontList.reduce((preferredFont, currentFont) => {
                if (currentFont.fontName.family === "Roboto" && currentFont.fontName.style === "Medium") {
                    return currentFont;
                }
                if (currentFont.fontName.family === "Helvetica" && currentFont.fontName.style === "Bold") {
                    return currentFont;
                }
                return preferredFont;
            }, fontList[0]).fontName;
        };
        // add text to title frame
        function createHeaderText(titleFontFamily) {
            console.log('iran');
            console.log(titleFontFamily);
            // jira link
            const URL = figma.createText();
            URL.fontName = titleFontFamily;
            URL.characters = msg.cardURL;
            URL.fontSize = 100;
            URL.fills = [{ type: 'SOLID', color: colorInkLight }];
            titleFrame.appendChild(URL);
            // branch title
            const branchTitle = figma.createText();
            branchTitle.fontName = titleFontFamily;
            branchTitle.characters = `(${msg.cardNumber}) ${msg.branchTitle}`;
            branchTitle.fontSize = 150;
            branchTitle.fills = [{ type: 'SOLID', color: colorInkBase }];
            titleFrame.appendChild(branchTitle);
            // created date and author
            const date = figma.createText();
            date.fontName = titleFontFamily;
            date.characters = "Created " + msg.curentDate + " by " + msg.branchAuthor;
            date.fills = [{ type: 'SOLID', color: colorInkLight }];
            date.fontSize = 100;
            titleFrame.appendChild(date);
        }
        yield figma.listAvailableFontsAsync()
            .then(checkForFonts)
            .then((fontName) => __awaiter(this, void 0, void 0, function* () {
            yield figma.loadFontAsync(fontName);
            return fontName;
        }))
            .then(createHeaderText)
            .then(() => {
            // add the title frame with its children to the page
            nodes.push(titleFrame);
            // select the new branch page, and scroll to view the generated title text
            figma.currentPage.selection = nodes;
            figma.viewport.scrollAndZoomIntoView(nodes);
        })
            .catch(err => {
            console.log('Something has gone terribly wrong: ' + err);
        });
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
});
