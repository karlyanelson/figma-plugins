// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  let assetList = [];

  function organizeAssets(child, assetType: 'png' | 'svg') {
    let exportSettings;

    if (assetType === 'png'){
      const pngExportSettings: ExportSettingsImage = {
        format: 'PNG',
        constraint: {type: 'SCALE', value: 2}
      }
      exportSettings = pngExportSettings;
    }

    if (assetType === 'svg'){
      const svgExportSettings: ExportSettingsSVG = {
        format: 'SVG'
      }
      exportSettings = svgExportSettings;
    }

    let newName;
    
    if (figma.command === "icon") {
      let name = child.name.replace(/\s\/\s/g, '/'); // "Direction / Arrow / Down / Large"  // get rid of any white space on either side of slash
      const groupNames = name.split('/'); // [ "Direction", "Arrow", "Down", "Large"]
      const newgroupNames = groupNames.map(s => s.split(/\s/).join('-')) // Remove any spaces between names and join by -
      newgroupNames.shift(); // [ "Arrow", "Down", "Large"]
      const sizeName = newgroupNames.pop() // Large  // newgroupNames =  [ " Arrow ", " Down "]
      newName = newgroupNames.join("/") + "/" + newgroupNames.join("-") + "-" + sizeName; // "Arrow" + "/" + "Down" + "/" + "Arrow-Down" + "-" "Large"
    }

    else {
      let name = child.name.replace(/\s\/\s/g, '/'); // "Traveller / Pose-8 => Traveller/Pose-8"  // get rid of any white space on either side of slash
      const nameArray = name.split('/'); // "Traveller/Pose-8" => ["Traveller", "Pose-8"]
      const newNameArray = nameArray.map(s => s.split(/\s/).join('-')) // Remove any spaces between names and join by -
      newName = newNameArray.join('-'); // ["Traveller", "Pose-8"] => Traveller-Pose-8
    }

    assetList.push(
      new Promise((resolver, rejection) => {
          child.exportAsync(exportSettings)
          .then(iconData => {
            let icon = {
            name: newName,
            data: iconData
          }
          resolver(icon);
        }, rejection)
      })
    );  
  }

  function traverse(node) {  
    if ("children" in node) {
      for (const child of node.children) {
        traverse(child)
  
        if (child.type === "COMPONENT") {
          if (msg.type  === 'export-svg') {
            organizeAssets(child, 'svg');
          }

          if (msg.type  === 'export-png') {
            organizeAssets(child, 'png');
          }
        }
      }
    }
  }

  if (msg.type  === 'export-svg' || msg.type  === 'export-png') {
    const selectedFrames = figma.currentPage.selection;

    if(selectedFrames.length > 0){

      selectedFrames.forEach(frame => {
        if (frame.type === "FRAME") {
          traverse(frame);
        } else {
          figma.ui.postMessage(false);
        }
      })
  
      Promise.all(assetList)
        .then(figma.ui.postMessage)
        .catch(err => {
          console.error(err);
          figma.ui.postMessage(err);
        });
    } else {
      figma.ui.postMessage(false);
    }
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  if (msg.type === 'cancel' || msg.type === 'close-ui') {
    figma.closePlugin();
  }
};