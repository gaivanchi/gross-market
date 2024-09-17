document.addEventListener("DOMContentLoaded", function () {
  $(window).on('scroll', function() {
    $(document).scrollTop() >= 50
      ? $('body').addClass('scrolled')
      : $('body').removeClass('scrolled');
  });
  
  // валидация формы
  $('form').validate({
    onkeyup: function(element) {
      $(element).valid();
    },
    normalizer: function(value) {
      return $.trim(value);
    },
    rules: {
      vacancy: {
        required: true,
      },
      name: {
        required: true,
      },
      birthday: {
        required: true,
        minlength: 10,
      },
      gender: {
        required: false,
      },
      phonenumber: {
        required: true,
        minlength: 18,
      },
      email: {
        required: false,
        email: true,
      },
      resume: {
        required: false,
      },
      file: {
        required: false,
      },
      captcha: {
        required: true,
      },
      agreement: {
        required: true,
      },
    },
    messages: {
      vacancy: {
        required: 'необходимо указать вакансию',
      },
      name: {
        required: 'введите ФИО',
      },
      birthday: {
        required: 'укажите дату рождения',
        minlength: 'поле заполнено не до конца',
      },
      gender: {},
      phonenumber: {
        required: 'укажите номер телефона',
        minlength: 'поле заполнено не до конца',
      },
      email: {
        required: 'укажите почту',
        email: 'поле заполнено не корректно',
      },
      resume: {},
      file: {},
      captcha: {
        required: '',
      },
      agreement: {
        required: 'необходимо подтвердить согласие',
      },
    },
    errorClass: 'input-error',
    errorPlacement: function (error, element) {
      if (element.is(':radio') || element.is(':checkbox')) {
        error.appendTo(element.parents('.form-item'));
      } else {
        error.insertAfter(element);
      }
    },
    highlight: function (element, errorClass) {
      $(element).closest('.form-item').removeClass('valid');
      $(element).addClass('bg-lightRed');
      $(element).closest('.checkbox-captcha').addClass('bg-lightRed');
    },
    unhighlight: function (element, errorClass) {
      if ($(element).val() === '') {
        $(element).closest('.form-item').removeClass('valid');
        return;
      } 
      $(element).closest('.form-item').addClass('valid');
      $(element).removeClass('bg-lightRed');
      $(element).closest('.checkbox-captcha').removeClass('bg-lightRed');
    },
    submitHandler: function (form) {
      form.submit();
    },
  });

  // валидация радио кнопок
  $('input[type="radio"]').on('change', function() {
    $(this).closest('.form-item').addClass('valid');
  });

  // запуск валидации при выборе чекбокса и селекта
  $('input[type="checkbox"], select').on('change', function() {
    $(this).valid();
  });

  // маски
  $('input[type="tel"]').inputmask({
    mask: '+7 (999) 999-99-99',
    placeholder: ' ',
    clearMaskOnLostFocus: true
  });
  $('input[name="birthday"]').inputmask({
    mask: '99.99.9999',
    placeholder: ' ',
    clearMaskOnLostFocus: true
  });

  // отображение названия прикрепленного файла
  $('input[type="file"]').on('change', function() {
    const $input = $(this);
    const $label = $input.parent().find('label');
    const fileName = $input[0]?.files[0]?.name; 
    if (fileName) {
      $label.text(fileName).addClass('black-text');  
    } else {
      $label.text('выберете или перетащите файл').removeClass('black-text');
    }
  });


  // слайдеры
  const bannersNavHandler = function() {
    const $items = $('.banners .owl-item');
    const $prev = $('.banners-prev');
    const $next = $('.banners-next');

    $prev.removeClass('disabled');
    $next.removeClass('disabled');

    if ($items.first().hasClass('active')) {
      $prev.addClass('disabled');
    };
    if ($items.last().hasClass('active')) {
      $next.addClass('disabled');
    };
  };

  $('.banners').owlCarousel({
    items: 1,
    nav: false,
    dots: false,
    margin: 150,
    slideBy: 1,
    // dotsEach: true,
    autoplay: true,
    autoplaySpeed: 2000,
    // autoplayTimeout: 2000,
    // autoplayHoverPause: true,
    loop: true,
    // autoHeight: true,
    // slideTransition: 'linear',
    onDragged: bannersNavHandler,
    responsive: {
      768: {
        autoplay: false,
        loop: false,
      },
    },
  });

  $('.banners-prev').on('click', function() {
    $('.banners').trigger('prev.owl.carousel');
    bannersNavHandler();
  });
  $('.banners-next').on('click', function() {
    $('.banners').trigger('next.owl.carousel');
    bannersNavHandler();
  });


  const cardsNavHandler = function() {
    const $items = $('.cards .owl-item');
    const $prev = $('.cards-prev');
    const $next = $('.cards-next');

    $prev.removeClass('disabled');
    $next.removeClass('disabled');

    if ($items.first().hasClass('active')) {
      $prev.addClass('disabled');
    };
    if ($items.last().hasClass('active')) {
      $next.addClass('disabled');
    };
  };

  $('.cards').owlCarousel({
    items: 1,
    nav: false,
    dots: false,
    margin: 30,
    stagePadding: 60,
    slideBy: 1,
    // dotsEach: true,
    autoplay: true,
    autoplaySpeed: 2000,
    // autoplayTimeout: 2000,
    // autoplayHoverPause: true,
    loop: true,
    // autoHeight: true,
    // slideTransition: 'linear',
    onDragged: cardsNavHandler,
    responsive: {
      480: {
        items: 1,
        stagePadding: 50,
      },
      640: {
        items: 2,
        stagePadding: 20,
        slideBy: 2,
      },
      768: {
        items: 2,
        stagePadding: 40,
        autoplay: false,
        loop: false,
      },
      900: {
        items: 2,
        stagePadding: 95,
        autoplay: false,
        loop: false,
      },
      1024: {
        items: 3,
        stagePadding: 75,
        autoplay: false,
        loop: false,
      },
      1280: {
        items: 3,
        stagePadding: 200,
        autoplay: false,
        loop: false,
      },
      1440: {
        items: 3,
        stagePadding: 160,
        autoplay: false,
        loop: false,
      },
      1600: {
        items: 3,
        stagePadding: 240,
        autoplay: false,
        loop: false,
      },
      1800: {
        items: 3,
        stagePadding: 330,
        autoplay: false,
        loop: false,
      },
    },
  });

  $('.cards-prev').on('click', function() {
    $('.cards').trigger('prev.owl.carousel');
    cardsNavHandler();
  });
  $('.cards-next').on('click', function() {
    $('.cards').trigger('next.owl.carousel');
    cardsNavHandler();
  });
  // конец слайдеры


  // карта
  ymaps.ready(init);

  function init() {
    const myMap = new ymaps.Map("map", {
      center: [55.755821, 37.617635],
      zoom: 12,
      controls: [
        // 'zoomControl',
        // 'rulerControl',
        // 'routeButtonControl',
        // 'trafficControl',
        // 'typeSelector',
        // 'fullscreenControl',
        // new ymaps.control.SearchControl({
        //   options: {
        //     size: 'large',
        //     provider: 'yandex#search'
        //   }
        // })
      ]
    });

    // добавление меток
    const placemarksData = [
      {
        coordinates: [55.763225, 37.562683],
        structure: 'company',
        hintContent: 'Юрлицо 1',
      },
      {
        coordinates: [55.779866, 37.626868],
        structure: 'company',
        hintContent: 'Юрлицо 2',
      },
      {
        coordinates: [55.766334, 37.669198],
        structure: 'company',
        hintContent: 'Юрлицо 3',
      },
      {
        coordinates: [55.729010, 37.574293],
        structure: 'company',
        hintContent: 'Юрлицо 4',
      },
      {
        coordinates: [55.740146, 37.664845],
        structure: 'company',
        hintContent: 'Юрлицо 5',
      },
      {
        coordinates: [55.762918, 37.611708],
        structure: 'individual',
        hintContent: 'Физлицо 1',
      },
      {
        coordinates: [55.751377, 37.588969],
        structure: 'individual',
        hintContent: 'Физлицо 2',
      },
      {
        coordinates: [55.783284, 37.565219],
        structure: 'individual',
        hintContent: 'Физлицо 3',
      },
      {
        coordinates: [55.733846, 37.629394],
        structure: 'individual',
        hintContent: 'Физлицо 4',
      },
      {
        coordinates: [55.730995, 37.607918],
        structure: 'individual',
        hintContent: 'Физлицо 5',
      },
    ];

    placemarksData.forEach(({ coordinates, structure, hintContent }) => {
      const placemark = new ymaps.Placemark(coordinates, {
        hintContent,
        structure,
      }, {
        iconLayout: 'default#image',
        iconImageHref: './img/svg/placemark.svg',
        iconImageSize: [60, 60],
        iconImageOffset: [-22, -22],
      });

      myMap.geoObjects.add(placemark);
    });

    $('.filter button').on('click', function() {
      if ($(this).hasClass('active')) {
        return;
      }
      $('.filter button').removeClass('active');
      $(this).addClass('active');
      if ($(this).hasClass('filter-companies')) {
        myMap.geoObjects.each(function (geoObject) {
          if (geoObject.properties.get('structure') === 'company') {
            geoObject.options.set('visible', true);
          } else {
            geoObject.options.set('visible', false);
          }
        });
      } else if ($(this).hasClass('filter-individuals')) {
        myMap.geoObjects.each(function (geoObject) {
          if (geoObject.properties.get('structure') === 'individual') {
            geoObject.options.set('visible', true);
          } else {
            geoObject.options.set('visible', false);
          }
        });
      } else if ($(this).hasClass('filter-all')) {
        myMap.geoObjects.each(function (geoObject) {
          geoObject.options.set('visible', true);
        });
      }
    })

    $('.zoom-plus').on('click', function() {
      myMap.setZoom(myMap.getZoom() + 1, { duration: 300 });
    });
    $('.zoom-minus').on('click', function() {
      myMap.setZoom(myMap.getZoom() - 1, { duration: 300 });
    });
  }


  // футер копирайт
  $(".footer__copyright").text( $(".footer__copyright").text().replace('%year%', (new Date()).getFullYear()) );
});  
