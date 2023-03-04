**microStudio** entegre bir video oyunu geliştirme ortamıdır.
İlk video oyununuzu yaratmak için gereken her şeye sahiptir!
**microStudio** şu imkanları sunar:

* Bir sprite düzenleyicisi (görseller, pixel art)
* Bir harita düzenleycisi (örn. harita ve seviyeler)
* Basit ama güçlü bir dil olan microScript ile programlama yapabileceğiniz bir kod düzenleyicisi.
* Geliştirme sürecinin herhangi aşamasında oyununuzu anında test edebilmenize yarayan %100 çevrimiçi operasyon.
* Oyunu, bitmiş ya da gelişirken, kolayca akıllı telefon ve tabletlere yükleme imkanı.
* Anında senkronizasyonla aynı projede birçok kişiyle aynı anda çalışma imkanı.
* Diğerlerinin projelerini keşfetmenize, öğrenmenize ve tekrar kullanmanıza imkan tanıyan topluluk paylaşım özellikleri.

# Hızlı Başlangıç

*Keşfet* bölümünde, diğer kullanıcıların projelerini keşfederek başlayabilirsiniz.

Misafir olarak oluşturmaya başlayabilir ya da hemen bir hesap kurabilirsiniz. Kullanıcı adı seçin (gerçek adınızı kullanmayın), eposta adresinizi girin (şifrenizi unutmanız halinde gerekli) ve başlayın!

## İlk Proje

*Oluştur* bölümünde yeni boş bir proje oluşturabilir, ya da Keşfet bölümünde var olan bir projeyi seçip "Klonla" tuşuna basarak kendi kopyanızı oluşturup özelleştirmeye başlayabilirsiniz.

### Kod

Projeniz oluşturulduğunda, "Kod" bölümündesiniz.. Programlamaya başlayabileceğiniz yer burası.. Aşağıdaki kodu kopyalayıp yapıştırın:

```lua
draw = function()
  screen.drawSprite ("icon",0,0,100,100)
end
```

### Çalıştırma

Daha sonra ekranınızın sağındaki Oynat tuşuna basın. Programınız çalışır ve görürsünüz ki yukarıdaki kod proje ikonunu ekranda görüntülüyor. Görüntü koordinatlarını (0 ve 100 basamaklarını) ve ikonun boyut ve pozisyonunun değişimini izleyin.

### Gerçek Zamanlı Değiştirme

Aşağıdaki kodu kopyalayıp yapıştırarak bu ilk programı daha etkileşimli yapabilirsiniz.

```lua
update = function()
  if keyboard.LEFT then x -= 1 end
  if keyboard.RIGHT then x += 1 end
  if keyboard.UP then y += 1 end
  if keyboard.DOWN then y -= 1 end
end

draw = function()
  screen.fillRect(0,0,400,400,"#000")
  screen.drawSprite("icon",x,y,20,20)
end
```

Bu sefer program, ikonu klavye tuşlarıyla hareket ettirmenize izin verir. ```update``` and ```draw``` fonksiyonlarının anlamları,  ```keyboard``` ile klavye tuşlarının testi, ```screen``` ile ekrandaki çizim, dokümantasyonun ileri safhalarında detaylıca açıklanır.

Ayrıca "Sprites" bölümüne gidebilir, "icon" elementine tıklayıp onu düzenleyebilirsiniz. Kod bölümüne gittiğinizde göreceksiniz ki yaptığınız bütün değişiklikler anında çalışmakta olan programa yansır.

# Keşfet

Ana bölüm *Kaşif* diğer kullanıcılar tarafından oluşturulan projeleri keşfetmenizi sağlar. Farklı stil ve temalarda oyun örnekleri, yeniden kullanılabilir şablonlar, sprite kütüphaneleri bulabilirsiniz. Belirli bir projeyle ilgileniyorsanız, onu klonlayabilir, yani daha sonra kendi amaçlarınız için değiştirebileceğiniz ve yeniden kullanabileceğiniz tam bir kopyasını oluşturabilirsiniz.

Oluştur bölümünde daha önce projelerinizden birini açtıysanız, incelemekte olduğunuz projelerin her bir sprite veya kaynak dosyasını mevcut projenize aktarabileceksiniz. Bu, topluluğun herkese açık projeleri arasından ilginizi çeken görüntüleri veya özellikleri seçmenize ve bunları kendi amaçlarınız için yeniden kullanmanıza olanak tanır.

# Bir Proje Oluştur

*Oluştur* ana bölümünde boş bir proje oluşturabilirsiniz. Projenizin birkaç bölümü vardır:
* **Kod** : Burası programlarınızı oluşturduğunuz ve projenizi test etmek ve hata ayıklamak için çalıştırmaya başladığınız yerdir.
* **Spritelar**: *spritelar* bu bölümde çizebileceğiniz ve değiştirebileceğiniz resimlerdir. Oyununuzu programlarken bunları görüntülemek (ekrana yapıştırmak) için bunlara kolayca başvurabilirsiniz.
* **Haritalar**: Haritalar, sprite'larınızı bir ızgara üzerinde bir araya getirerek oluşturabileceğiniz sahneler veya seviyelerdir. Bunları programınızda kolayca ekranda görüntüleyebilirsiniz.
* **Dök.** : Burada projeniz için belgeler yazabilirsiniz; bu bir oyun tasarım belgesi, bir öğretici, projenizi şablon olarak yeniden kullanmak için bir kılavuz vb. olabilir.
* **Ayarlar**: Burada projeniz için çeşitli seçenekler belirleyebilir; diğer kullanıcıları da sizinle birlikte projenize katılmaya davet edebilirsiniz.
* **Yayınla**: Burada projenizi herkese açık hale getirebilirsiniz; bir açıklama oluşturmayı ve etiketler eklemeyi unutmayın.

## Kod

Bu bölümde projenizi programlar ve test edersiniz. Projeniz için otomatik olarak bir kaynak kod dosyası oluşturulur. Projenizin fonksiyonlarını çeşitli alt kümelere bölmek için başkalarını ekleyebilirsiniz.

Bir microStudio programının çalışması, 3 temel fonksiyonu uygulamanıza dayanır:

* değişkenlerinizi başlattığınız ```init`` fonksiyonu
* Nesnelerinizi canlandırdığınız ve girişleri taradığınız ``update`` işlevi
* Ekran üzerinde çizim yaptığınız ```draw`` fonksiyonu

<!--- help_start init = function --->
### ```init()``` fonksiyonu

init işlevi, yalnız bir kere program başlatıldığında çağrılır. Özellikle programın geri kalanında kullanılabilecek global değişkenlerin başlangıç durumunu tanımlamak için kullanışlıdır.
<!--- help_end --->
##### örnek
```lua
init = function()
  status = "welcome"
  level = 1
  position_x = 0
  position_y = 0
end
```

### ```update()``` fonksiyonu
<!--- help_start update = function --->
``update`` işlevi saniyede 60 kez çağrılır. Bu fonksiyonun gövdesi, oyunun mantığını ve fiziğini programlamak için en iyi yerdir: durum değişiklikleri, sprite veya düşman hareketleri, çarpışma algılama, klavye, dokunmatik veya gamepad girdilerinin değerlendirilmesi vb.
<!--- help_end --->

##### örnek
```lua
update = function()
  if keyboard.UP then y = y+1 end
end
```

Yukarıdaki kod, klavyedeki ``YUKARI`` tuşuna basıldığında (yukarı ok) y değişkeninin değerini saniyenin her 60`ında bir 1 artırır

<!--- help_start draw = function --->
### ```draw()``` fonksiyonu
Ekran yenilenebildiği sürece ```draw`` fonksiyonu çağrılır. Bu, sahnenizi ekrana çizmeniz gereken yerdir, örneğin büyük renkli bir dikdörtgeni doldurarak (ekranı silmek için), ardından üzerine birkaç sprite veya şekil çizerek.
<!--- help_end --->

##### örnek
```lua
draw = function()
  // fill the screen with black
  screen.fillRect(0,0,screen.width,screen.width,screen.height, "rgb(0,0,0)")
  // draw the sprite "icon" in the center of the screen, in size 100x100
  screen.drawSprite("icon",0,0,100,100)
end
```

Çoğu durumda, ``draw`` saniyede 60 kez çağrılır. Ancak bazı bilgisayarlar veya tabletler ekranlarını saniyede 120 kez veya daha fazla yenileyebilir. Ayrıca, programı çalıştıran cihaz aşırı yüklenmiş olabilir ve ekranı saniyede 60 kez yenileyemez, bu durumda ``draw`` fonksiyonu daha az sıklıkta çağrılacaktır. Bu nedenle ``update`` ve ``draw`` iki ayrı fonksiyondur: ne olursa olsun, ``update`` saniyede tam 60 kez çağrılacaktır; ve ``draw`` çağrıldığında, ekranı yeniden çizme zamanı gelmiştir

### Çalıştırma

"Kod" bölümünde, ekranın sağ kısmı, kaynak kodunu değiştirmeye devam ederken programınızı çalışırken görmenizi sağlar. Programı başlatmak için düğmeye tıklamanız yeterlidir. Programınızın yürütülmesini istediğiniz zaman düğmeye tıklayarak durdurabilirsiniz.

### Konsol

Programınızın yürütülmesi sırasında, konsolu *microScript* ile basit komutlar yürütmek için kullanabilirsiniz. Örneğin, geçerli değerini öğrenmek için bir değişkenin adını girebilirsiniz.

##### örnekler
position_x değişkeninin mevcut değerini bilmek
```lua
> position_x
34
>
```
position_x'in değerini değiştirmek
```
> position_x = -10
-10
>
```
position_x'teki değişikliği ve bunun ekrandaki çizim üzerindeki etkisini görmek için draw() fonksiyonunu çağırmak (yürütmenin duraklatıldığını varsayarak)
```
> draw()
>
```

### İzler

Program kodunuzda, ``print()`` fonksiyonunu kullanarak istediğiniz zaman konsolda görüntülenecek metin gönderebilirsiniz.

##### örnek
```lua
draw = function()
  // your draw implementation()

  print(position_x)
end
```
## Spritelar

Sprite'lar ekranda hareket edebilen görüntülerdir. microStudio*'daki çizim aracı, sprite'lar oluşturmanıza olanak tanır ve daha sonra bunları ekranda istenen konumda ve boyutta görüntülemek için program kodunda kullanılabilir.

### Bir Sprite Oluşturma
Her proje, uygulamanın simgesi olarak işlev görecek "icon" adı verilen varsayılan bir sprite'a sahiptir. Sprite ekle* seçeneğine tıklayarak yeni sprite'lar oluşturabilirsiniz. Bunları istediğiniz gibi yeniden adlandırabilir ve boyutlarını piksel cinsinden (genişlik x yükseklik) tanımlayabilirsiniz.

### Çizim seçenekleri
*microStudio* klasik çizim fonksiyonlarını sunar: kalem, dolgu, silgi, açıklaştırma, koyulaştırma, yumuşatma, kontrastı artırma, doygunluğu değiştirme.

Damlalık aracı klavyedeki [Alt] tuşuna basılarak her zaman kullanılabilir.

*Döşeme* ve simetri seçenekleri "tekrarlanabilir" sprite'lar veya bir veya iki simetri eksenine sahip sprite'lar oluşturmanıza yardımcı olacaktır.

##### İpucu
Görüntü dosyalarını microStudio projenize aktarabilirsiniz. Bunu yapmak için, PNG veya JPG dosyalarını (256x256 piksel boyutuna kadar) sprite listesine sürükleyip bırakın.

## Harita
microStudio'daki bir harita, sprite'ları birleştirmek için bir ızgaradır. Bir dekoru bir araya getirmenize veya bir seviye oluşturmanıza olanak tanır.

### Bir Harita Oluşturma
Haritalar oluşturulabilir, tıpkı sprite'lar gibi yeniden adlandırılabilir. Izgaranın boyutunu (hücre sayısı olarak) değiştirmek mümkündür. Her hücre bir sprite ile boyanabilir. Her hücrenin piksel boyutunu değiştirmek mümkündür, bu genellikle ızgarayı boyamak için kullanılan sprite'ların boyutunu yansıtmalıdır.


## Ayarlar
*Ayarlar* sekmesi, projenizin bazı unsurlarını özelleştirmenize olanak tanır.
### Seçenekler
Projenizin başlığını, tanımlayıcısını (URL'sini, yani internet adresini oluşturmak için kullanılır) tanımlayabilirsiniz.

Projenizin dikey veya yatay modda kullanılması gerektiğini belirtebilirsiniz. Uygulamanızı bir akıllı telefona veya tablete yüklerken bu seçim dikkate alınacaktır.

Ekrandaki görüntüleme alanı için istediğiniz oranları da belirleyebilirsiniz. Bu, farklı oranlarda ekranlara sahip cihazlara yüklendiğinde uygulamanın her zaman iyi görünmesini sağlamak için bir seçenektir.

### Kullanıcılar

Kullanıcılar bölümü, arkadaşlarınızı projenize katılmaya davet etmenize olanak tanır. Davet etmek istediğiniz arkadaşınızın takma adını bilmeniz gerekir. Bir arkadaş davet edildikten sonra, davetinizi kabul ederse, projenize tam erişime sahip olacak ve istediği değişiklikleri yapabilecektir (sprite, harita, kod vb. değiştirmek, eklemek, silmek). Ancak, proje seçeneklerinin ve katılımcı listesinin değiştirilmesi proje sahibine saklıdır.

## Yayımlama

*microStudio* projenizi yayınlamak veya dışa aktarmak için birkaç seçenek sunar. Projenizi bağımsız bir HTML5 uygulaması olarak, çevrimiçi dağıtım için, sitenizde veya oyun dağıtım platformlarında dışa aktarabilirsiniz. Ayrıca projenizi *microStudio* üzerinde herkese açık hale getirebilir, topluluğun onunla oynamasına, yorum yapmasına, kaynak kodunu ve varlıkları keşfetmesine izin verebilirsiniz... Gelecek için daha fazla dışa aktarma seçeneği planlanmaktadır.

### Projeyi Halka Açık Yapma

Projenizi herkesin erişimine açmak için (salt okunur), "Projemi herkese açık yap" seçeneğine tıklayın. Projeniz herkese açık olduğunda, microstudio sitesinin keşif sekmesinde görüntülenecektir. Herhangi bir ziyaretçi oyunu çalıştırabilir, kaynak kodunu ve projenizin diğer bileşenlerini görüntüleyebilir ve yeniden kullanabilir.

Oyununuzun ``https://microstudio.io/author_nickname/game_id/`` şeklinde kalıcı bir URL'si vardır. Elbette bağlantıyı herkese dağıtabilir veya oyununuzu bir iframe içine yerleştirerek mevcut web sitenize ekleyebilirsiniz.
### HTML5'e Aktarma

Projenizin tamamını bağımsız bir HTML5 uygulamasına aktarmak için "HTML5'e Aktar "a tıklayın. Bu, oyununuzu çalıştırmak için gerekli tüm dosyaları içeren bir ZIP arşivinin indirilmesini tetikler: sprite'lar, bazı JavaScript dosyaları, simgeler ve bir ana HTML dosyası "index.html". Oyununuz yerel olarak çalıştırılabilir (index.html dosyasına çift tıklayın) veya mevcut web sitenize yükleyebilirsiniz. Ayrıca HTML5 oyunlarını kabul eden birçok çevrimiçi oyun dağıtım platformunda yayınlanmaya hazırdır (HTML5 dışa aktarma panelinde birkaç tane öneriyoruz).
