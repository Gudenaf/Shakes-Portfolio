(() => {
    "use strict";

    // Добавление loaded для HTML после полной загрузки страницы
    function addLoadedClass() {
        window.addEventListener("load", (function() {
            document.documentElement.classList.add("lock");
            setTimeout((function() {
                document.documentElement.classList.remove("lock");
                document.documentElement.classList.add("loaded");
            }), 0);
        }));
    }

    // Получение хеша в адресе сайта
    function getHash() {
        if (location.hash) return location.hash.replace("#", "");
    }

    // блокировка всей страницы при клике на бургер
    let bodyLockStatus = true;
    let bodyLockToggle = (delay = 500) => {
        if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
    };
    let bodyUnlock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                body.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            }
            body.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };

    // Burger menu
    function menuInit() {
        if (document.querySelector(".icon-menu")) document.addEventListener("click", (function(e) {
            if (bodyLockStatus && e.target.closest(".icon-menu")) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        }));
    }
    function menuClose() {
        bodyUnlock();
        document.documentElement.classList.remove("menu-open");
    }

    // Уникализация массива
    function uniqArray(array) {
        return array.filter((function(item, index, self) {
            return self.indexOf(item) === index;
        }));
    }

    // Модуль плавной проктутки к блоку
    let gotoblock_gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
        const targetBlockElement = document.querySelector(targetBlock);
        if (targetBlockElement) {
            let headerItem = "";
            let headerItemHeight = 0;
            if (noHeader) {
                headerItem = "header.header";
                headerItemHeight = document.querySelector(headerItem).offsetHeight;
            }
            let options = {
                speedAsDuration: true,
                speed,
                header: headerItem,
                offset: offsetTop,
                easing: "easeOutQuad"
            };
            // Закрываем меню, если оно открыто
            document.documentElement.classList.contains("menu-open") ? menuClose() : null;
            // Прокрутка с использованием дополнения
            if ("undefined" !== typeof SmoothScroll) (new SmoothScroll).animateScroll(targetBlockElement, "", options);
        }
    };

    // Инициализация слайдеров
    function initSliders() {
        // Проверяем, есть ли слайдер на странице
        if (document.querySelector(".swiper")) new Swiper(".swiper", {
            autoHeight: true,
            // Кнопки "влево/вправо"
            navigation: {
                prevEl: ".swiper-button-prev",
                nextEl: ".swiper-button-next"
            },
            // Брейкпоинты
            breakpoints: {
                320: {
                    slidesPerView: 2,
                    spaceBetween: 22
                },
                480: {
                    slidesPerView: 2,
                    spaceBetween: 22
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 22
                },
                992: {
                    slidesPerView: 2,
                    spaceBetween: 22
                },
                1511: {
                    slidesPerView: 3,
                    spaceBetween: 26
                }
            }
        });
    }
    // Запуск инициализации слайдеров
    window.addEventListener("load", (function(e) {
        initSliders();
    }));

    // Наблюдатель объектов на базе Intersection Observed API
    class ScrollWatcher {
        constructor(props) {
            let defaultConfig = {
                logging: true
            };
            this.config = Object.assign(defaultConfig, props);
            this.observer;
            !document.documentElement.classList.contains("watcher") ? this.scrollWatcherRun() : null;
        }
        // Обновляем конструктор
        scrollWatcherUpdate() {
            this.scrollWatcherRun();
        }
        // Запускаем конструктор
        scrollWatcherRun() {
            document.documentElement.classList.add("watcher");
            this.scrollWatcherConstructor(document.querySelectorAll("[data-watch]"));
        }
        // Конструктор наблюдателей
        scrollWatcherConstructor(items) {
            if (items.length) {
                // Уникализируем параметры
                let uniqParams = uniqArray(Array.from(items).map((function(item) {
                    return `${item.dataset.watchRoot ? item.dataset.watchRoot : null}|${item.dataset.watchMargin ? item.dataset.watchMargin : "0px"}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`;
                })));
                // Получаем группы объектов с одинаковыми параметрами,
                // создаем настройки, инициализируем наблюдатель
                uniqParams.forEach((uniqParam => {
                    let uniqParamArray = uniqParam.split("|");
                    let paramsWatch = {
                        root: uniqParamArray[0],
                        margin: uniqParamArray[1],
                        threshold: uniqParamArray[2]
                    };
                    let groupItems = Array.from(items).filter((function(item) {
                        let watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null;
                        let watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : "0px";
                        let watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : 0;
                        if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) return item;
                    }));
                    let configWatcher = this.getScrollWatcherConfig(paramsWatch);
                    // Инициализация наблюдателя со своими настройками
                    this.scrollWatcherInit(groupItems, configWatcher);
                }));
            }
        }
        // Функция создания настроек
        getScrollWatcherConfig(paramsWatch) {
            // Создаем настройки
            let configWatcher = {};
            // Родитель, внутри которого ведется наблюдение
            if (document.querySelector(paramsWatch.root)) configWatcher.root = document.querySelector(paramsWatch.root);
            // Отступ срабатывания
            configWatcher.rootMargin = paramsWatch.margin;
            if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) return;
            // Точки срабатывания
            if ("prx" === paramsWatch.threshold) ; else paramsWatch.threshold = paramsWatch.threshold.split(",");
            configWatcher.threshold = paramsWatch.threshold;
            return configWatcher;
        }
        // Функция создания нового наблюдателя со своими настройками
        scrollWatcherCreate(configWatcher) {
            this.observer = new IntersectionObserver(((entries, observer) => {
                entries.forEach((entry => {
                    this.scrollWatcherCallback(entry, observer);
                }));
            }), configWatcher);
        }
        // Функция инициализации наблюдателя со своими настройками
        scrollWatcherInit(items, configWatcher) {
            // Создание нового наблюдателя со своими настройками
            this.scrollWatcherCreate(configWatcher);
            // Передача наблюдателю элементов
            items.forEach((item => this.observer.observe(item)));
        }
        // Функция обработки базовых действий точек срабатывания
        scrollWatcherIntersecting(entry, targetElement) {
            // Видим объект
            // Добавляем класс
            if (entry.isIntersecting) !targetElement.classList.contains("_watcher-view") ? targetElement.classList.add("_watcher-view") : null;
            // Не видим объект
            // Убираем класс
            else targetElement.classList.contains("_watcher-view") ? targetElement.classList.remove("_watcher-view") : null;
        }
        // Функция отключения слежения за объектом
        scrollWatcherOff(targetElement, observer) {
            observer.unobserve(targetElement);
        }
        // Функция обработки наблюдения
        scrollWatcherCallback(entry, observer) {
            const targetElement = entry.target;
            // Обработка базовых действий точек срабатывания
            this.scrollWatcherIntersecting(entry, targetElement);
            // Если есть атрибут data-watch-once убираем слежку
            targetElement.hasAttribute("data-watch-once") && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
            // Создаем свое событие обратной связи
            document.dispatchEvent(new CustomEvent("watcherCallback", {
                detail: {
                    entry
                }
            }));
        }
    }
    // Запускаем и добавляем в объект модулей
    const modules_flsModules = {};
    modules_flsModules.watcher = new ScrollWatcher({});

    // Переменная контроля добавления события window scroll.
    let addWindowScrollEvent = false;

    // Плавная навигация по странице
    function pageNavigation() {
        // Работаем при клике на пункт
        document.addEventListener("click", pageNavigationAction);
        // Если подключен scrollWatcher, подсвечиваем текущий пункт меню
        document.addEventListener("watcherCallback", pageNavigationAction);
        // Основная функция
        function pageNavigationAction(e) {
            if ("click" === e.type) {
                const targetElement = e.target;
                if (targetElement.closest("[data-goto]")) {
                    const gotoLink = targetElement.closest("[data-goto]");
                    const gotoLinkSelector = gotoLink.dataset.goto ? gotoLink.dataset.goto : "";
                    const noHeader = gotoLink.hasAttribute("data-goto-header") ? true : false;
                    const gotoSpeed = gotoLink.dataset.gotoSpeed ? gotoLink.dataset.gotoSpeed : 500;
                    const offsetTop = gotoLink.dataset.gotoTop ? parseInt(gotoLink.dataset.gotoTop) : 0;
                    gotoblock_gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
                    e.preventDefault();
                }
            } else if ("watcherCallback" === e.type && e.detail) {
                const entry = e.detail.entry;
                const targetElement = entry.target;
                // Обработка пунктов навигации, если указано значение navigator подсвечиваем текущий пункт меню
                if ("navigator" === targetElement.dataset.watch) {
                    document.querySelector(`[data-goto]._navigator-active`);
                    let navigatorCurrentItem;
                    if (targetElement.id && document.querySelector(`[data-goto="#${targetElement.id}"]`)) navigatorCurrentItem = document.querySelector(`[data-goto="#${targetElement.id}"]`); else if (targetElement.classList.length) for (let index = 0; index < targetElement.classList.length; index++) {
                        const element = targetElement.classList[index];
                        if (document.querySelector(`[data-goto=".${element}"]`)) {
                            navigatorCurrentItem = document.querySelector(`[data-goto=".${element}"]`);
                            break;
                        }
                    }
                    // Видим объект
                    if (entry.isIntersecting) navigatorCurrentItem ? navigatorCurrentItem.classList.add("_navigator-active") : null;
                    // Не видим объект
                    else navigatorCurrentItem ? navigatorCurrentItem.classList.remove("_navigator-active") : null;
                }
            }
        }
        // Прокрутка по хешу
        if (getHash()) {
            let goToHash;
            if (document.querySelector(`#${getHash()}`)) goToHash = `#${getHash()}`; else if (document.querySelector(`.${getHash()}`)) goToHash = `.${getHash()}`;
            goToHash ? gotoblock_gotoBlock(goToHash, true, 500, 20) : null;
        }
    }

    // Работа с шапкой при скроле
    function headerScroll() {
        addWindowScrollEvent = true;
        const header = document.querySelector("header.header");
        const headerShow = header.hasAttribute("data-scroll-show");
        const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
        const startPoint = header.dataset.scroll ? header.dataset.scroll : 1;
        let scrollDirection = 0;
        let timer;
        document.addEventListener("windowScroll", (function(e) {
            const scrollTop = window.scrollY;
            clearTimeout(timer);
            if (scrollTop >= startPoint) {
                // downscroll code
                !header.classList.contains("_header-scroll") ? header.classList.add("_header-scroll") : null;
                if (headerShow) {
                    if (scrollTop > scrollDirection) header.classList.contains("_header-show") ? header.classList.remove("_header-show") : null; else !header.classList.contains("_header-show") ? header.classList.add("_header-show") : null;
                    timer = setTimeout((() => {
                        // upscroll code
                        !header.classList.contains("_header-show") ? header.classList.add("_header-show") : null;
                    }), headerShowTimer);
                }
            } else {
                header.classList.contains("_header-scroll") ? header.classList.remove("_header-scroll") : null;
                if (headerShow) header.classList.contains("_header-show") ? header.classList.remove("_header-show") : null;
            }
            scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
        }));
    }
    // При подключении модуля FLS обработчик события запустится автоматически
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);

    window["FLS"] = true;
    addLoadedClass();
    menuInit();
    pageNavigation();
    headerScroll();
})();