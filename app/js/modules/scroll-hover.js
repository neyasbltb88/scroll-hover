(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
        if (typeof window === 'object') {
            window.ScrollHover = factory();
        }
    } else {
        // Browser globals (root is window)
        root.ScrollHover = factory();
    }
}(this, function() {
    return class ScrollHover {
        constructor(params) {
            this.wrap = params.wrap;
            this.content = params.content;
            this.pxPreSec = params.pxPreSec || 100;
            this.scope_attr = 'scrollhoverscope';

            this.init();
        }

        // Служебный метод, нужен для генерации scopedID
        rand(min, max) {
            let rand = Math.floor(min + Math.random() * (max + 1 - min));
            return rand;
        }

        // Служебный метод, генерирующий атрибут для изоляции стилей
        scopedIdGenerate() {
            let id = '';
            for (let i = 0; i < 10; i++) {
                id += String.fromCharCode(this.rand(97, 122));
            }

            return id;
        }

        // Метод, шаблонизирующий стили для скролла по ховеру. 
        // Подставляет значения, которые нужны для равномерной скорости скролла различного
        // объема контента в контейнерах различной высоты
        getStyleTemplate(scope, duration, translate_y) {
            return `
            ${this.wrap}[data-${this.scope_attr}=${scope}] .content {
                transition: transform ${duration}ms linear;
                will-change: transform;
            }
    
            ${this.wrap}[data-${this.scope_attr}=${scope}]:hover .content {
                transform: translate3d(0, ${translate_y}px, 1px);
            }`;
        }

        // Метод, создающий элемент стилей внутри контейнера.
        // Выполняет все расчеты для обеспечения нужной скорости скролла
        makeStyle(wrap, content) {
            // Генерируем атрибут изоляции стилей
            let scope = this.scopedIdGenerate();
            wrap.dataset[this.scope_attr] = scope;

            // Получаем высоту контента
            let content_height = parseInt(getComputedStyle(content).height);

            // Получаем высоту контейнера и на ее основе получаем 
            // максимальное значение сдвига контента
            let wrap_height = parseInt(getComputedStyle(wrap).height);
            let translate_y = wrap_height - content_height;
            // Если высота контента меньше высоты контейнера, то ничего двигать не надо
            translate_y = (translate_y < 0) ? translate_y : 0;

            // Зная величину сдвига, получаем длительность transition,
            // чтобы обеспечить стабильную скорость скролла
            let duration = (Math.abs(translate_y) / this.pxPreSec) * 1000;

            // Из полученных данных генерируем индивидуальные стили
            let style = document.createElement('style');
            style.textContent = this.getStyleTemplate(scope, duration, translate_y);

            // И добавляем их в свой контейнер
            wrap.appendChild(style);
        }

        init() {
            // На документ вешаем обработчик на событие захода мыши на элемент
            document.addEventListener('mouseover', e => {
                // Если мышь попала на блок контента
                if (e.target.classList.contains(this.wrap.substring(1))) {
                    let wrap = e.target;
                    let content = wrap.querySelector(this.content);

                    // И если в контейнере этого контента еще нет стилей для его скролла
                    if (!wrap.querySelector('style')) {
                        // То запустим создание этих стилей
                        this.makeStyle(wrap, content);
                    }
                }
            })
        }
    }


}))