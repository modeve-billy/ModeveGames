# Справка о функциях

## Экран ``screen``

В *microStudio* экран представлен предопределенным объектом "screen". Для отображения фигур или изображений на экране достаточно вызвать функции (также называемые *методами*) этого объекта. Например:

```
screen.setColor("#FFF")
screen.fillRect(0,0,100,100,100)
```
В приведенном выше коде цвет отрисовки определяется как ``#FFF``, то есть белый (см. пояснения ниже). Затем он рисует прямоугольник, заполненный этим цветом, с центром в координатах 0, 0 на экране (т.е. в центре экрана), шириной 100 и высотой 100.

Чтобы облегчить работу, *microStudio* автоматически масштабирует координаты экрана, независимо от фактического разрешения дисплея. В соответствии с правилами, наименьший размер экрана (ширина в портретном режиме, высота в ландшафтном режиме) равен 200. Начальная точка (0,0) является центром экрана, поэтому наименьший размер градуируется от -100 до +100. Наибольшее значение градуируется, например, от -178 до +178 (классический экран 16:9), от -200 до +200 (экран 2:1, более длинные, более современные смартфоны) и т.д.


![Экранные координаты](img/screen_coordinates.png "Экранные координаты")

<small>*Система координат рисунка на экране 16:9 в портретном режиме и в ландшафтном режиме*</small>


### Определение цвета
<!--- suggest_start screen.setColor --->
##### screen.setColor(color)

Определяет цвет, который будет использоваться для последующих вызовов функций отрисовки.

<!--- suggest_end --->

Цвет определяется строкой символов, заключенных в кавычки "". Обычно он описывается компонентами RGB, т.е. смесью красного, зеленого и синего цветов. Возможны несколько типов обозначений:

* ``rgb(255,255,255)``: (rgb для красного, зеленого, синего). Здесь указывается значение для красного, зеленого и синего цветов, изменяющееся от 0 до 255 максимум. ``rgb(255,255,255)`` дает белый цвет, ``rgb(255,0,0)`` - ярко-красный, ``rgb(0,255,0)`` - зеленый и т.д. Чтобы легче выбрать цвет при кодировании, щелкните на цвете rgb и удерживайте клавишу Control, чтобы отобразить меню выбора цвета.
* ``#FFF`` или ``#FFFFFF``: это обозначение использует шестнадцатеричную систему счисления для описания трех компонентов - красного, зеленого и синего. Шестнадцатеричная система счисления - это система счисления по "основанию 16", то есть с использованием 16 цифр, от 0 до 9, затем от A до F.
* Существуют и другие системы счисления, которые здесь не описываются.

### Очистка экрана
<!--- suggest_start screen.clear --->
##### screen.clear(color)
Очищает экран (заливает его указанным цветом или черным, если цвет не указан в качестве аргумента).
<!--- suggest_end --->

### Рисование фигур
<!--- suggest_start screen.fillRect --->
##### screen.fillRect(x, y, width, height, color)
Рисует заполненный прямоугольник, с центром в координатах x и y, с указанными шириной и высотой. Цвет необязателен, если он опущен, будет повторно использован последний использованный цвет.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRoundRect --->
##### screen.fillRoundRect(x, y, width, height, radius, color)
Рисует заполненный закругленный прямоугольник с центром в координатах x и y, с указанными шириной, высотой и радиусом кривизны. Цвет необязателен, если он опущен, будет повторно использован последний использованный цвет.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRound --->
##### screen.fillRound(x, y, width, height, color)
Рисует сплошную круглую фигуру ( круг или эллипс, в зависимости от используемых размеров) с центром в координатах x и y, с указанными шириной и высотой. Цвет необязателен, если он опущен, будет повторно использован последний использованный цвет.
<!--- suggest_end --->

<!--- suggest_start screen.drawRect --->
##### screen.drawRect(x, y, width, height, color)
Рисует контур прямоугольника с центром в координатах x и y, с указанными шириной и высотой. Цвет необязателен, если он опущен, будет повторно использован последний использованный цвет.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRoundRect --->
##### screen.drawRoundRect(x, y, width, height, radius, color)
Рисует контур закругленного прямоугольника с центром в координатах x и y, с указанными шириной, высотой и радиусом кривизны. Цвет необязателен, если он опущен, будет повторно использован последний использованный цвет.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRound --->
##### screen.drawRound(x, y, width, height, color)
Рисует контур круглой формы с центром в координатах x и y, с указанными шириной и высотой. Цвет необязателен, если он опущен, будет повторно использован последний использованный цвет.
<!--- suggest_end --->

<!--- suggest_start screen.drawLine --->
##### screen.drawLine(x1, y1, x2, y2, color)
Рисует линию, соединяющую точки (x1,y1) и (x2,y2). Цвет необязателен, если он опущен, будет повторно использован последний использованный цвет.
<!--- suggest_end --->

<!--- suggest_start screen.fillPolygon --->
##### screen.fillPolygon(x1, y1, x2, y2, x3, y3, ... , color)
Заполняет многоугольник, определенный списком координат точек, переданных в качестве аргументов. Цвет необязателен, если он опущен, то будет повторно использован последний использованный цвет.
<!--- suggest_end --->

Функция также может принимать массив в качестве первого аргумента и цвет в качестве второго аргумента. В этом случае ожидается, что массив будет содержать координаты точек следующим образом: ``screen.fillPolygon([x1, y1 , x2, y2, x3, y3 ... ], color)``.

<!--- suggest_start screen.drawPolygon --->
##### screen.drawPolygon(x1, y1, x2, y2, x3, y3, ... , color)
Рисует контур полигона, определяемый списком координат точек, переданных в качестве аргументов. Цвет необязателен, если он опущен, то будет повторно использован последний использованный цвет.
<!--- suggest_end --->

Функция также может принимать массив в качестве первого аргумента и цвет в качестве второго аргумента. В этом случае ожидается, что массив будет содержать координаты точек следующим образом: ``screen.drawPolygon([x1, y1 , x2, y2, x3, y3 ... ], color)``.

<!--- suggest_start screen.drawPolyline --->
##### screen.drawPolyline(x1, y1, x2, y2, x3, y3, ... , color)
То же, что и `drawPolygon`, за исключением того, что путь рисования не будет автоматически замыкаться.
<!--- suggest_end --->

<!--- suggest_start screen.setLineWidth --->
##### screen.setLineWidth(width)
Устанавливает ширину линии для всех последующих операций рисования линии (drawLine, drawPolygon, drawRect и т.д.). По умолчанию ширина линии равна 1.
<!--- suggest_end --->

<!--- suggest_start screen.setLineDash --->
##### screen.setLineDash(array_of_values)
Устанавливает стиль штриха линии для всех последующих операций рисования линии (drawLine, drawPolygon, drawRect и т.д.). Аргумент должен быть массивом положительных значений, определяющих длину линий и промежутков.

#### Пример
```
screen.setLineDash([2,4])
```
<!--- suggest_end --->


### Отображение спрайтов и карт

<!--- suggest_start screen.drawSprite --->
##### screen.drawSprite(sprite, x, y, width, height)

Рисует на экране один из спрайтов, созданных в разделе *Спрайты*. Первым параметром является строка, соответствующая имени отображаемого спрайта, например, ``"icon"``. Затем следуют координаты x и y, по которым будет отображаться спрайт (спрайт будет центрирован по этим координатам). Затем ширина и высота отображения.
<!--- suggest_end --->

```
screen.drawSprite("icon", 0, 50, 50, 50)
```
Высота может быть опущена, как в примере выше. В этом случае высота будет рассчитана в соответствии с шириной и пропорциями спрайта.

##### Анимированные спрайты

Анимированные спрайты будут автоматически рисовать нужный кадр в соответствии с настройками анимации. Установить текущий кадр спрайта (например, чтобы перезапустить анимацию) можно следующим образом:

```
sprites["спрайт1"].setFrame(0) // 0 - это индекс первого кадра
```

Вы также можете нарисовать определенный кадр анимации вашего спрайта, добавив "." и индекс запрашиваемого кадра:

```
screen.drawSprite("спрайт1.0", 0, 50, 50, 50)
```

Приведенный пример рисует 0-й кадр спрайта "спрайт1".

<!--- suggest_start screen.drawSpritePart --->
##### screen.drawSpritePart(sprite, part_x, part_y, part_width, part_height, x, y, width, height)

Рисует часть спрайта на экране. Первым параметром является строка, соответствующая имени отображаемого спрайта, например ``"icon"``. Следующие 4 параметра определяют координаты под-прямоугольника спрайта, который будет нарисован на экране (координата 0,0 - левый верхний угол спрайта). Последние 4 параметра такие же, как и для ``drawSprite``.
<!--- suggest_end --->

```
screen.drawSpritePart("icon", 4, 4, 8, 8, 0, 50, 50, 50)
```
Высота может быть опущена, как в примере выше. В этом случае высота будет рассчитана в соответствии с шириной и пропорциями части спрайта.

---

<!--- suggest_start screen.drawMap --->
##### screen.drawMap(map, x, y, width, height)
Рисует на экране одну из карт, созданных в разделе *Карты*. Первым параметром является строка, соответствующая имени отображаемой карты, например ``map1``. Затем следуют координаты x и y, по которым будет отображаться карта (карта будет центрирована по этим координатам). Затем ширина и высота отображения.
<!--- suggest_end --->

```
screen.drawMap("map1", 0, 0, 300, 200)
```
### Отображение текста

<!--- suggest_start screen.drawText --->
##### screen.drawText(text, x, y, size, &lt;color&gt;)
Рисует текст на экране. Первым параметром является текст, который будет отображаться, затем координаты x и y, по которым текст будет центрирован, затем размер (высота) текста. Последний параметр - цвет отрисовки, его можно не указывать, в этом случае будет использован последний заданный цвет.
<!--- suggest_end --->

```
screen.drawText("Привет!", 0, 0, 30, "#FFF")
```

<!--- suggest_start screen.drawTextOutline --->
##### screen.drawTextOutline(text, x, y, size, &lt;color&gt;)
Рисует контур текста. Рисование контура другим цветом может быть выполнено после ``drawText`` для увеличения контраста. Толщина контура может быть задана с помощью ``screen.setLineWidth``.
<!--- suggest_end --->

```
screen.drawTextOutline("Привет!", 0, 0, 30, "#F00")
```

---

<!--- suggest_start screen.setFont --->
##### screen.setFont(font_name)
Определяет шрифт, который будет использоваться для последующих вызовов ``drawText``.

**Доступные шрифты в текущей версии**: AESystematic, Alkhemikal, AlphaBeta, Arpegius, Awesome, BitCell, Blocktopia, Comicoro, Commodore64, DigitalDisco, Edunline, EnchantedSword, EnterCommand, Euxoi, FixedBold, GenericMobileSystem, GrapeSoda, JupiterCrash, Kapel, KiwiSoda, Litebulb8bit, LycheeSoda, MisterPixel, ModernDos, NokiaCellPhone, PearSoda, PixAntiqua, PixChicago, PixelArial, PixelOperator, Pixellari, Pixolde, PlanetaryContact, PressStart2P, RainyHearts, RetroGaming, Revolute, Romulus, Scriptorium, Squarewave, Thixel, Unbalanced, UpheavalPro, VeniceClassic, ZXSpectrum, Zepto
<!--- suggest_end --->

```
screen.setFont("BitCell")
```

**Совет**: глобальная переменная ``fonts`` представляет собой массив всех доступных шрифтов в microStudio.

<!--- suggest_start screen.loadFont --->
##### screen.loadFont(font_name)
Инициирует загрузку шрифта. Используется в сочетании с `screen.isFontReady`.
<!--- suggest_end --->

```
screen.loadFont("DigitalDisco")
```
<!--- suggest_start screen.isFontReady --->
##### screen.isFontReady(font_name)
Возвращает 1 (true), если данный шрифт загружен и готов к использованию. Убедитесь, что сначала вызвали `screen.loadFont`, иначе ваш шрифт может не загрузиться.
<!--- suggest_end --->
Вы можете опустить аргумент функции, в этом случае проверяется, загружен ли текущий шрифт и готов ли он к использованию (шрифт по умолчанию или другой шрифт, который вы установили последним вызовом `screen.setFont(font_name)`).

```
if screen.isFontReady() then
  // мы можем использовать шрифт по умолчанию
  screen.drawText("МОЙ ТЕКСТ", 0, 0, 50)
end

screen.loadFont("DigitalDisco") // убедитесь, что DigitalDisco будет загружен

if screen.isFontReady("DigitalDisco")
  screen.setFont("DigitalDisco")
  screen.drawText("ДРУГОЙ ТЕКСТ", 0, 50, 20)
end
```


<!--- suggest_start screen.textWidth --->
##### screen.textWidth(text, size)
Возвращает ширину заданного текста при рисовании на экране с заданным размером.
<!--- suggest_end --->

```
width = screen.textWidth("Мой текст", 20)
```

### Параметры рисования
<!--- suggest_start screen.setAlpha --->
##### screen.setAlpha(a)
Определяет общий уровень непрозрачности для всех функций рисования, вызываемых в дальнейшем. Значение 0 соответствует полной прозрачности (невидимые элементы), а значение 1 - полной непрозрачности (нарисованные элементы полностью скрывают то, что находится ниже).
<!--- suggest_end --->

```
screen.setAlpha(0.5) // следующие нарисованные элементы будут полупрозрачными
```

Когда вы используете эту функцию, чтобы нарисовать некоторые элементы с небольшой прозрачностью, не забудьте сбросить параметр alpha на его значение по умолчанию:

```
screen.setAlpha(1) // значение по умолчанию, полная непрозрачность
```

---

<!--- suggest_start screen.setLinearGradient --->
##### screen.setLinearGradient(x1, y1, x2, y2, color1, color2)
Определяет цвет рисунка как линейный градиент цвета, т.е. градиент. ``x1 и y1`` - координаты начальной точки градиента. ``x2 и y2`` - координаты конечной точки градиента. ``color1`` - начальный цвет (значения цветов см. в ``setColor``). ``Color2`` - конечный цвет.
<!--- suggest_end --->

```
screen.setLinearGradient(0, 100, 0, -100, "#FFF", "#F00")
screen.fillRect(0, 0, screen.width, screen.height)
```
Приведенный выше пример создает градиент от белого к красному, сверху вниз экрана, а затем заполняет экран этим градиентом.

---

<!--- suggest_start screen.setRadialGradient --->
##### screen.setRadialGradient(x, y, radius, color1, color2)
Определяет цвет рисунка как радиальный градиент цвета, т.е. градиент в форме круга. ``x`` и ``y`` - координаты центра круга. ``radius`` - радиус круга. ``color1`` - цвет в центре круга (значения цветов см. в ``setColor``). ``color2`` - цвет по периметру круга.
<!--- suggest_end --->

```
screen.setRadialGradient(0, 0, 100, "#FFF", "#F00")
screen.fillRect(0, 0, screen.width, screen.height)
```
Приведенный выше пример создает градиент от белого в центре экрана к красному по краям экрана, а затем заполняет экран этим градиентом.

---

<!--- suggest_start screen.setTranslation --->
##### screen.setTranslation(tx, ty)
Определяет перевод экранных координат для последующих операций рисования.
<!--- suggest_end --->

```
screen.setTranslation(50, 50)
screen.fillRect(0, 0, 20, 20)
```
Прямоугольник в приведенном выше примере будет нарисован со смещением 50, 50

Не забудьте сбросить перевод на 0, 0 всякий раз, когда вам нужно остановить перевод операций рисования.
```
screen.setTranslation(0,0)
```

<!--- suggest_start screen.setDrawRotation --->
##### screen.setDrawRotation(angle)
Определяет угол поворота для следующих операций рисования. Угол выражается в градусах.
<!--- suggest_end --->

```
screen.setDrawRotation(45)
screen.drawSprite("icon", 0, 0, 100)
```
В примере выше показана иконка проекта, наклоненная на 45 градусов.

Не забудьте сбросить угол поворота на 0 после его использования!
```
screen.setDrawRotation(0) // возвращает угол поворота к значению по умолчанию
```

<!--- suggest_start screen.setDrawScale --->
##### screen.setDrawScale(x, y)
Определяет масштабирующий фактор для отрисовки следующих элементов на экране. ``x`` определяет масштабный коэффициент по оси x, а ``y`` - по оси y. Значение 2 будет отображать в два раза больше. Значение -1 позволяет, например, перевернуть спрайт (зеркально), по горизонтали (x) или по вертикали (y).
<!--- suggest_end --->

```
screen.setDrawScale(1, -1)
screen.drawSprite ("icon", 0, 0, 100)
```
В примере выше показана иконка проекта, развернутая вертикально.

Не забудьте сбросить масштабный коэффициент до 1.1 после его использования!
```
screen.setDrawScale(1, 1) // возвращает масштабирующий фактор к его значению по умолчанию.
```

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setDrawAnchor(anchor_x, anchor_y)
По умолчанию все операции рисования считают ваши координаты центром рисуемой фигуры. Вы можете изменить это, вызвав команду
`screen.setDrawAnchor(anchor_x, anchor_y)`, чтобы указать другую точку привязки для рисования фигур.

<!--- suggest_end --->
По оси x точка привязки может быть установлена на -1 (левая сторона фигуры), 0 (центр фигуры), 1 (правая сторона фигуры) или любое промежуточное значение. На оси y точка привязки может быть установлена на -1 (нижняя сторона вашей фигуры), 0 (центр вашей фигуры), 1 (верхняя часть вашей фигуры) или на любое промежуточное значение.

Примеры
```
screen.setDrawAnchor(-1, 0) // полезно для выравнивания текста слева
screen.setDrawAnchor(-1, -1) // ваши координаты рисования теперь интерпретируются как левый нижний угол вашей фигуры.
screen.setDrawAnchor(0, 0) // значение по умолчанию, все фигуры будут рисоваться по центру относительно ваших координат.
```

<!--- suggest_start screen.setBlending --->
##### screen.setBlending(blending)
Определяет, как последующие операции рисования будут сочетаться с основным, уже нарисованным изображением. Может быть установлено значение `normal` или `additive`.

Вы также можете использовать любой из режимов композинга, определенных в спецификации HTML5 Canvas с помощью `setBlending`, для справки см. https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
<!--- suggest_end --->

<!--- suggest_start screen.width --->
##### screen.width
Поле "width" объекта screen имеет значение текущей ширины экрана (всегда 200, если экран находится в портретном режиме, см. раздел *Координаты экрана*).
<!--- suggest_end --->

<!--- suggest_start screen.height --->
##### screen.height
Поле "height" объекта screen имеет значение текущей высоты экрана (всегда 200, если экран находится в альбомном режиме, см. *координаты экрана*).
<!--- suggest_end --->

<!--- suggest_start screen.setCursorVisible --->
##### screen.setCursorVisible(visible)
Вы можете использовать эту функцию, чтобы показать или скрыть курсор мыши.
<!--- suggest_end --->


## Входы, управление

Чтобы сделать вашу программу интерактивной, вам нужно знать, нажимает ли пользователь клавишу на клавиатуре, джойстике, прикасается к сенсорному экрану, и если да, то где. *microStudio* позволяет узнать состояние этих различных интерфейсов управления через объекты ``keyboard`` (для клавиатуры), ``touch`` (для сенсорного экрана / мыши), ``mouse`` (для указателя мыши / сенсорного экрана) ``gamepad`` (для контроллера).

##### Примечание
Объект ``system.inputs`` хранит полезную информацию о том, какие методы ввода доступны в хост-системе:

|Поле|Значение|
|-|-|
|system.inputs.keyboard|1, если предполагается, что система имеет физическую клавиатуру, иначе 0|
|system.inputs.mouse|1, если система имеет мышь, в противном случае 0|
|system.inputs.touch|1, если система имеет сенсорный экран, в противном случае 0|
|system.inputs.gamepad|1, если к системе подключен хотя бы один геймпад, 0 в противном случае (геймпад может показаться подключенным только тогда, когда пользователь выполнил на нем какое-либо действие)|


### Клавиатурные входы
<!--- suggest_start keyboard --->
Вводы с клавиатуры могут быть проверены с помощью объекта ``keyboard``.
<!--- suggest_end --->

##### Пример
```
if keyboard.A then
  // в данный момент нажата клавиша A
end
```

Обратите внимание, что при тестировании проекта, для того чтобы события от клавиатуры попали в окно выполнения, необходимо сначала щелкнуть в нем.

Приведенный ниже код показывает идентификатор каждой нажатой клавиши. Это может быть полезно для составления списка идентификаторов, которые понадобятся для вашего проекта.

```
draw = function()
  screen.clear()
  local y = 80
  for key in keyboard
    if keyboard[key] then
      screen.drawText(key, 0, y, 15, "#FFF")
      y -= 20
    end
  end
end
```
*microStudio* создает для вас несколько полезных общих кодов, таких как UP, DOWN, LEFT и RIGHT, которые реагируют как на клавиши со стрелками, так и на ZQSD / WASD в зависимости от раскладки клавиатуры.

Для проверки специальных символов, таких как +, - или даже круглые скобки, вы должны использовать следующий синтаксис: ``keyboard["("]``, ``keyboard["-"]``.

##### Проверка того, была ли только что нажата клавиша.
В контексте функции ``update()`` можно проверить, была ли только что нажата клавиша пользователем, используя ``keyboard.press.<KEY>``.

Пример:

```
if keyboard.press.A then
  // Делаем что-то один раз, как только пользователь нажимает клавишу A
end
```

##### Проверка того, была ли клавиша только что отпущена
В контексте функции ``update()`` вы можете проверить, была ли клавиша клавиатуры только что отпущена пользователем, используя ``keyboard.release.<KEY>``.

Пример:

```
if keyboard.release.A then
  // Делаем что-то один раз, в тот момент, когда пользователь отпускает клавишу A
end
```


<!--- suggest_start touch --->
### Сенсорные входы

Сенсорные входы можно протестировать с помощью объекта "touch" (который также сообщает о состоянии мыши).
<!--- suggest_end --->

|Поле|Значение|
|-|-|
|touch.touching|Истина, если пользователь касается экрана, ложь, если нет|
|touch.x|Положение x, где экран был затронут|
|touch.y|Положение y, в котором экран был затронут|
|touch.touches|Если вам нужно учитывать несколько точек касания одновременно, touch.touches - это список активных точек касания|
|touch.press|true, если палец только что начал касаться экрана|
|touch.release|true, если палец только что покинул экран|

```
if touch.touching
  // пользователь касается экрана
else
 // пользователь не касается экрана
end
```

```
draw = function()
  for t in touch.touches
    screen.drawSprite("icon", t.x, t.y, 50)
  end
end
```
Приведенный выше пример показывает иконку проекта в каждой активной точке касания на экране.  

<!--- suggest_start mouse --->
### Входы мыши

Входы мыши можно протестировать с помощью объекта ``mouse`` (который также сообщает о событиях касания).
<!--- suggest_end --->

|Поле|Значение|
|-|-|
|mouse.x|Положение x указателя мыши|
|mouse.y|Положение y указателя мыши|
|mouse.pressed|1 если нажата любая кнопка мыши, 0 в противном случае|
|mouse.left|1 если нажата левая кнопка мыши, 0 иначе|
|mouse.right|1 если нажата правая кнопка мыши, 0 иначе|
|mouse.middle|1 если нажата средняя кнопка мыши, 0 иначе|
|mouse.press|true если кнопка мыши только что была нажата|
|mouse.release|true если кнопка мыши только что была отпущена|

### Входы контроллера (геймпад)
<!--- suggest_start gamepad --->
Состояние кнопок и джойстиков на контроллере (геймпаде) можно проверить с помощью объекта "gamepad".
<!--- suggest_end --->

##### Пример
```
if gamepad.UP then y += 1 end
```

**Совет**: Чтобы получить полный список полей объекта "gamepad", просто введите "gamepad" в консоли, когда ваша программа запущена.

Точно так же, как и для нажатия клавиш клавиатуры, вы можете использовать ``gamepad.press.<BUTTON>`` для проверки того, была ли кнопка только что нажата, или ``gamepad.release.<BUTTON>`` для проверки того, была ли кнопка только что отпущена.

## Звуки

В настоящее время *microStudio* позволяет воспроизводить звуки и музыку, которые вы импортировали в свой проект (в виде WAV и MP3 файлов) или создавать звуки программно с помощью унаследованного *beeper*.

### Воспроизвести звук
<!--- suggest_start audio.playSound --->
##### audio.playSound(name, volume, pitch, pan, loop)
Воспроизводит заданный звук с необязательными заданными настройками воспроизведения.
<!--- suggest_end --->

##### Аргументы
|Аргумент|Описание|
|-|-|
|name|Имя воспроизводимого звука (из вкладки sounds вашего проекта)|
|volume|[необязательно] Выходная громкость для воспроизведения этого звука, в диапазоне от 0 до 1|
|pitch|[необязательно] Выходной тон для воспроизведения этого звука, 1 - это тон по умолчанию|
|pan|[необязательно] Настройка скорости для этого звукового воспроизведения, в диапазоне от -1 (слева) до 1 (справа)|
|loop|[необязательно] Установите значение 1 (true), если вы хотите, чтобы звук зацикливался бесконечно|

Вызов функции возвращает объект. Этот объект позволяет управлять настройками воспроизведения во время воспроизведения звука:

##### Пример
```
my_sound = audio.playSound("имя звука")
my_sound.setVolume(0.5)
```

|Функции управления|описание|
|-|-|
|my_sound.setVolume(volume)|Изменяет громкость воспроизведения звука (значение в диапазоне от 0 до 1)|
|my_sound.setPitch(pitch)|Изменяет высоту звука (1 - высота по умолчанию)|
|my_sound.setPan(pan)|Изменяет настройку скорости звука (значение в диапазоне от -1 до 1)|
|my_sound.stop()|Останавливает воспроизведение этого звука|

### Воспроизведение музыки
<!--- suggest_start audio.playMusic --->
##### audio.playMusic(name, volume, loop)
Воспроизводит заданную музыку с необязательными заданными настройками воспроизведения.
<!--- suggest_end --->

##### Аргументы
|Аргумент|Описание|
|-|-|
|name|Название музыки (из раздела "Музыка" вашего проекта) для воспроизведения|
|volume|[необязательно] Выходная громкость для воспроизведения этой музыки, в диапазоне от 0 до 1|
|loop|[необязательно] Установите значение 1 (true), если вы хотите, чтобы музыка зацикливалась бесконечно|

Вызов функции возвращает объект. Этот объект позволяет управлять настройками воспроизведения во время проигрывания музыки:

##### Пример
```
my_music = audio.playMusic("название музыки")
my_music.setVolume(0.5)
```

|Функции управления|описание|
|-|-|
|my_music.setVolume(volume)|Изменяет громкость воспроизведения музыки (значение в диапазоне от 0 до 1)|
|my_music.stop()|Останавливает воспроизведение этой музыки|
|my_music.play()|Возобновляет воспроизведение, если вы остановили его раньше|
|my_music.getPosition()|Возвращает текущую позицию воспроизведения в секундах|
|my_music.getDuration()|Возвращает общую продолжительность музыки в секундах|


<!--- suggest_start audio.beep --->
### audio.beep
Воспроизводит звук, описанный строкой, переданной в качестве параметра.

```
audio.beep("C E G")
```
<!--- suggest_end --->
Более подробный пример и пояснения в таблице ниже:
```
"saw duration 100 span 50 duration 500 volume 50 span 50 loop 4 C2 C F G G F end"
```

|Команда|Описание|
|-|-|
|saw| указывает тип звукового генератора (цвет звука), возможные значения: пила, синус, квадрат, шум|
|duration|следующее за ним число миллисекунд указывает длительность нот|
|tempo|следующее за ним число нот в минуту указывает на темп|
|span|следующее за ним число от 1 до 100 указывает процент удержания каждой ноты|
|volume|следующее за ним число от 0 до 100, устанавливает громкость|
|C|или D, E, F и т.д. указывает на ноту, которую нужно сыграть. Можно также указать октаву, например, C5 для C 5-й октавы клавиатуры.|
|loop|за ним следует число, обозначающее количество повторений следующей последовательности. Последовательность заканчивается ключевым словом ``end``, например: ``loop 4 C4 E G end``; число 0 означает, что цикл должен повторяться бесконечно.|

<!--- suggest_start audio.cancelBeeps --->
### audio.cancelBeeps
Отменяет все звуки, воспроизводимые *бипером*. Полезно для отключения звука после запуска музыкальных циклов.
<!--- suggest_end --->

## Методы спрайтов
Ваша программа может получить доступ к спрайтам вашего проекта, которые хранятся в предопределенном объекте ``sprites``:

```
mysprite = sprites["icon"]
```

Затем вы можете получить доступ к различным полям и методам вашего спрайта:

|Поле/метод|описание|
|-|-|
|``mysprite.width``|ширина спрайта в пикселях|
|``mysprite.height``| Высота спрайта в пикселях|
|``mysprite.ready``|1, если спрайт полностью загружен, иначе 0|
|``mysprite.name``|Имя спрайта|

*Примечание: другие поля и собственные методы могут казаться доступными, когда вы осматриваете объект спрайта в консоли. Такие недокументированные поля и методы могут быть отключены в будущем, поэтому не полагайтесь на них слишком сильно!

## Методы карт
Ваша программа может обращаться к картам вашего проекта, которые хранятся в предопределенном объекте ``maps``:

```
mymap = maps["map1"]
```

Затем вы можете получить доступ к различным полям и методам вашей карты:

|Поле/метод|описание|
|-|-|
|``mymap.width``|Ширина карты в ячейках|
|``mymap.height``|Высота карты в ячейках|
|``mymap.block_width``|Ширина ячейки карты в пикселях|
|``mymap.block_height``|Высота ячейки карты в пикселях|
|``mymap.ready``|1, если карта полностью загружена, иначе 0|
|``mymap.name``|Название карты|
|``mymap.get(x, y)``|Возвращает имя спрайта в ячейке (x, y); начало координат - (0, 0), расположенное в левом нижнем углу карты. Возвращает 0, если ячейка пуста|
|``mymap.set(x, y, name)``|Устанавливает новый спрайт в ячейку (x, y); начало координат - (0, 0), расположенную в левой нижней части карты. Третий параметр - имя спрайта.|
|``mymap.clone()``|Возвращает новую карту, которая является полной копией mymap.|

*Примечание: другие поля и собственные методы могут казаться доступными, когда вы осматриваете объект карты в консоли. Такие недокументированные поля и методы могут быть отключены в будущем, поэтому не полагайтесь на них слишком сильно!

## Ассеты
Менеджер ассетов в microStudio позволяет импортировать различные типы файлов в ваш проект и загружать их из вашего кода.
В настоящее время он поддерживает следующие типы файлов:
* **.TTF**: файлы шрифтов, которые могут быть использованы для отображения текста на экране
* **.JSON**: структурированные данные JSON загружаются как объект microScript
* **.GLB**, **.OBJ**: 3D модели (могут быть загружены и использованы только с Babylon.js или micro3D)
* **.TXT**: обычные текстовые файлы, которые могут быть загружены как строковое значение
* **.CSV**: файлы значений, разделенных запятыми, также могут быть загружены как строковое значение

### Вкладка Ассеты
Вкладка "Ассеты" должна быть активирована для вашего проекта, что можно сделать на вкладке опций проекта.

### Загрузка ассетов
В отличие от спрайтов, карт и других встроенных ассетов, импортируемые вами пользовательские ассеты не загружаются при запуске проекта microStudio. Вам
необходимо загрузить их из вашего кода. Загрузка происходит асинхронно, и у вас есть два способа проверить, загружен ли ваш ассет и готов ли он к использованию:
* Вы можете установить необязательную функцию обратного вызова; эта функция будет вызвана, когда актив будет загружен, с данными, переданными в качестве аргумента.
* Функция загрузки также возвращает объект `loader`, который имеет свойство `.ready`. Как только вы убедитесь, что свойство установлено в 1 (true), данные готовы и присоединены как свойство объекта loader.

<!--- suggest_start asset_manager.loadFont --->.
##### asset_manager.loadFont("myfolder/myfont" )
Инициирует загрузку шрифта.
<!--- suggest_end --->.

Затем вы можете проверить, готов ли шрифт, и использовать его так же, как и встроенные шрифты:

```
if screen.isFontReady("myfont") then ... end
screen.setFont("myfont")
```

<!--- suggest_start asset_manager.loadJSON --->
##### loader = asset_manager.loadJSON( "myfolder/myjsonfile", callback )
Инициирует загрузку JSON-файла. Результатом будет объект microScript, содержащий все данные.
<!--- suggest_end --->.

Загрузка является асинхронной, у вас есть два способа проверить, когда загрузка завершена:

###### Пример с использованием функции обратного вызова
```
asset_manager.loadJSON("somefolder/myjsonfile", function(data)
    myobject = data
  end)
```

###### Пример использования объекта загрузчика
```
loader = asset_manager.loadJSON("somefolder/myjsonfile")
(...)
if loader.ready then
  myobject = loader.data
end
```

<!--- suggest_start asset_manager.loadText --->
##### loader = asset_manager.loadText( "myfolder/myjsonfile", callback )
Инициирует загрузку текстового файла. Результатом будет строка microScript, содержащая весь текст.
<!--- suggest_end --->.

Загрузка происходит асинхронно, у вас есть два способа проверить завершение загрузки:

###### Пример с использованием функции обратного вызова
```
asset_manager.loadText("somefolder/mytextfile", function(text)
    mytext = text
  end)
```

###### Пример использования объекта loader
```
loader = asset_manager.loadText("somefolder/mytextfile")
(...)
if loader.ready then
  mytext = loader.text
end
```

<!--- suggest_start asset_manager.loadCSV --->
##### loader = asset_manager.loadCSV( "myfolder/mycsvfile", callback )
Инициирует загрузку CSV-файла. Результатом будет строка microScript, содержащая весь текст файла.
<!--- suggest_end --->.

Примечание: содержимое CSV-файла возвращается, как если бы это был обычный текстовый файл. Вы должны обработать весь парсинг из вашего кода.
Загрузка происходит асинхронно, у вас есть два способа проверить, когда загрузка завершена:

###### Пример с использованием функции обратного вызова
```
asset_manager.loadCSV("somefolder/mycsvfile", function(text)
    mytext = text
  end)
```

###### Пример использования объекта loader
```
loader = asset_manager.loadCSV("somefolder/mycsvfile")
(...)
if loader.ready then
  mytext = loader.text
end
```

<!--- suggest_start asset_manager.loadModel --->
##### loader = asset_manager.loadModel( "myfolder/mymodelfile", callback )
Инициирует загрузку 3D модели. Это работает, только если вы выбрали Babylon.js или micro3D в качестве графических движков для вашего проекта.
Результатом является объект `container`, содержащий все данные модели.
<!--- suggest_end --->.

Загрузка происходит асинхронно, у вас есть два способа проверить завершение загрузки:

###### Пример с использованием функции обратного вызова
```
asset_manager.loadModel("somefolder/mymodelfile", function(container)
    container.addAllToScene()
    // или посмотрите документацию Babylon.js для других способов обработки результата
    // asset_manager.loadModel отображается на BABYLON.SceneLoader.LoadAssetContainer
  end)
```

###### Пример использования объекта загрузчика
```
loader = asset_manager.loadModel("somefolder/mymodelfile")
(...)
if loader.ready then
  loader.container.addAllToScene()
end
```

## Система
Объект ``system`` позволяет получить общую информацию о системе хоста, выдает текущее время и позволяет контролировать поток выполнения.

### Информация

<!--- suggest_start system.inputs --->
#### system.inputs
Предоставляет информацию о наличии методов ввода на хост-системе: клавиатура, мышь, сенсорный экран или геймпад.

<!--- suggest_end --->

<!--- suggest_start system.language --->
#### system.language
Устанавливается на предпочитаемый язык пользователя.
<!--- suggest_end --->

<!--- suggest_start system.fps --->
#### system.fps
Дает текущую эффективную частоту кадров.
<!--- suggest_end --->

### Запрос

<!--- suggest_start system.say --->
##### system.say( message )
Открывает окно для отображения текстового сообщения.
<!--- suggest_end --->

<!--- suggest_start system.prompt --->
##### system.prompt( message, callback )
Открывает окно с предложением пользователю ввести текст.
<!--- suggest_end --->

Функция обратного вызова, переданная в качестве аргумента, вызывается с двумя параметрами, `callback( ok, text )`.

|Аргумент|Описание|
|-|-|
|ok|1 если пользователь подтвердил свой ввод, 0 в противном случае|
|text|текст, набранный пользователем, если он подтвердил ввод|


### Пауза и выход

<!--- suggest_start system.pause --->
##### system.pause()
Приостанавливает выполнение программы. Это работает только тогда, когда программа выполняется в среде разработки microStudio. Выполнение может быть возобновлено вручную в этой среде.
<!--- suggest_end --->

<!--- suggest_start system.exit --->
##### system.exit()
Завершает работу программы.
<!--- suggest_end --->


### Время

<!--- suggest_start system.time --->
##### system.time()
Возвращает прошедшее время в миллисекундах (с 1 января 1970 года).
<!--- suggest_end --->

###

## Хранилище
Объект ``storage`` позволяет постоянно хранить данные вашего приложения. Вы можете использовать его для хранения пользовательского прогресса, высоких результатов или другой информации о состоянии вашей игры или проекта.

<!--- suggest_start storage.set --->
##### storage.set(name , value)
Постоянно хранит значение, на которое ссылается строка ``name``. Значение (value) может быть любым числом, строкой, списком или структурированным объектом.
<!--- suggest_end --->

<!--- suggest_start storage.get --->
##### storage.get(name)
Возвращает значение, хранящееся под строкой со ссылкой ``name``. Возвращает ``0``, если такой записи не существует.
<!--- suggest_end --->