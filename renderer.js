var regionButtons = document.querySelectorAll('span');
var warning = document.querySelector('p#warning');

Array.from(regionButtons).forEach(link => {
    link.addEventListener('click', function(event) {
        if(link.classList.contains('selected')){
            link.classList.remove('selected');
        } else {
            link.classList.add('selected');
        }

        if(document.querySelectorAll('span.selected').length == 0){
            warning.classList.remove('hide');
        } else {
            warning.classList.add('hide');
        }
    });
});