$(document).ready(function () {
    // Menu de navegação de slide
    $('#nav-expander').on('click', function (e) {
        e.preventDefault();
        $('body').toggleClass('nav-expanded');
    });
    $('.mobile-list').on('click', function (e) {
        console.log('clicked');
        e.preventDefault();
        $('body').toggleClass('nav-expanded');
    })
});