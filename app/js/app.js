import ScrollHover from './modules/scroll-hover';

// =============== Применение ===============

// wrap - класс элемента с overflow, внутри которого рсположен контент, который нужно скроллить по ховеру
// content - класс элемента контента, его будем двигать
// pxPreSec - количество пикселей, которые будут скроллиться за 1 секунду

new ScrollHover({
    wrap: '.wrap',
    content: '.content',
    pxPreSec: 100
});