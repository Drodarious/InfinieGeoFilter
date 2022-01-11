const fs = require('fs');
const sudo = require('sudo-prompt');

const HOSTS_FILE_PATH = "C:\\Windows\\System32\\drivers\\etc\\hosts";
const servers = [];
const sudoOptions = {
  name: 'InfiniteGeoFilter'
};

window.addEventListener('DOMContentLoaded', () => {

  // Get the user's current hosts file content
  fs.readFile(HOSTS_FILE_PATH, 'utf-8', (err, data) => {

      if(err){
          alert("An error ocurred reading the file :" + err.message);
          return;
      }

      hostFileContent = data;

      checkSelected();
  });

  const saveButton = document.getElementById('SaveBtn');

  saveButton.onclick = () => {

    saveButton.innerHTML = 'filtering...';
    saveButton.classList.add('active');

    const cleanedContent = removeGeoFilters();
    const newContent = appendGeoFilters(cleanedContent);
    const command = createCMD(newContent);

    sudo.exec(command, sudoOptions,
      function(error) {
        if (error) {
          saveButton.innerHTML = 'Error: ' + error.message;
        } else {
          saveButton.innerHTML = 'done!';
        }
        setTimeout(() => {
          saveButton.innerHTML = 'filter';
          saveButton.classList.remove('active');
        }, 3000);
      }
    );

  };

  const clearButton = document.getElementById('ClearBtn');

  clearButton.onclick = () => {

    clearButton.innerHTML = 'resetting...';
    clearButton.classList.add('active');

    const cleanedContent = removeGeoFilters();
    const command = createCMD(cleanedContent);

    sudo.exec(command, sudoOptions,
      function(error) {
        if (error) {
          clearButton.innerHTML = 'Error: ' + error.message;
        } else {
          clearButton.innerHTML = 'filters reset!';
          document.querySelector('p#warning').classList.remove('hide');
          document.querySelectorAll('span').forEach(span => {
            span.classList.remove('selected');
          });
        }
        setTimeout(() => {
          clearButton.innerHTML = 'reset';
          clearButton.classList.remove('active');
        }, 3000);
      }
    );

  };

});

//remove all references to the current geo filters from the 'hosts' file
function removeGeoFilters(){

  const cleanedContent = [];
  const contentArray = hostFileContent.split('# InfiniteGeoFilterStart');
  const head = contentArray[0]; // everything BEFORE the first instance of '# InfiniteGeoFilterStart'
  let body = '';
  let content = '';

  for (let i = 1; i < contentArray.length; i++) {

    body += contentArray[i].split('# InfiniteGeoFilterEnd')[1].trimEnd(); // everything AFTER '# InfiniteGeoFilterEnd' in each section

  }

  content = (head + body);

  content.split(/\r?\n/).forEach((contentLine, i) => {
    if(!servers.includes(contentLine)){
      cleanedContent.push(contentLine);
    }
  });

  return cleanedContent.join('\n').trim();

}

//append selected GeoFilters to the end of the user's 'hosts' file contents
function appendGeoFilters(cleanedContent){

  var regions = document.querySelectorAll('span');

  cleanedContent = cleanedContent + '\n '
  cleanedContent = cleanedContent + '\n# InfiniteGeoFilterStart'

  Array.from(regions).forEach(region => {
      const isSelected = region.classList.contains('selected');
      const server = region.getAttribute('data-value');
      if(!isSelected){
        cleanedContent = cleanedContent + `\n${server}`;
      }
  });

  cleanedContent = cleanedContent + '\n# InfiniteGeoFilterEnd'

  return (cleanedContent).trim();

}

//build out the bash command
function createCMD(newContent){

  let newContentLines = newContent.split(/\r?\n/);
  let batch = '';

  for (let i = 0; i < newContentLines.length; i++) {

    const isBlankLine = newContentLines[i].replace(/\s+/g, '') == '';
    const command = isBlankLine ? 'echo.' : 'echo';
    const newLine = (i == 0) ? '' : '\n';
    const opperator = (i > 0) ? '>>' : '>';
    const content = isBlankLine ? '' : newContentLines[i].trim();

    batch += `${newLine}${command} ${content} ${opperator} ${HOSTS_FILE_PATH}`;

  }

  return batch;

}


function checkSelected(){

  if(!hostFileContent.includes('InfiniteGeoFilterStart')){
    return;
  }

  document.querySelectorAll('span').forEach(span => {

    const server = span.getAttribute('data-value');

    if(!hostFileContent.includes(server)){
      span.classList.add('selected');
    }

    if(document.querySelectorAll('span.selected').length > 0){
      document.querySelector('p#warning').classList.add('hide');
    }

    servers.push(server);

  });

}