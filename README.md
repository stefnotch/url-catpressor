# URL Catpressor

[**View it in action here**](https://stefnotch.github.io/url-catpressor/)

Getting this to work involved the code being like  

![No](https://c.tenor.com/LAHdIKYb2U8AAAAd/cat-glitch.gif)

until I bonked it hard enough.

## Wait how does this work?

It takes a URL and then
1. Strips off the HTTP/HTTPS (= 1 bit, though the current implementation wastes an entire byte)
2. Brotli-compresses your URL (= n bytes)
3. Encodes some bytes by picking cat-words
    - 256 different words, so one word encodes one byte
4. Encodes the remaining bytes by picking different letters for the cat-words
    - Like for the letter `l`, there are a few [look-alikes](https://en.wikipedia.org/wiki/Homoglyph) such as `1`, `I`, `|`
    - This part is very fun, because I ended up picking a fun encoding scheme...remember how binary uses 0 and 1 as its symbols? And how hexadecimal has 16 different symbols? Well, the letter-look-alikes approach has the fun property that some letters have a lot of look-alikes and others have very few. Thus, a word ends up being a cursed mixture of base 2, base 16, base 23, base 11, base 5, and more depending on the letters...


*But hey, at least I don't have to pay for a server to host a sensible backend!*

  
## Licensing Information

CC0 applies to my code. Sadly there are a few dependencies that I couldn't elegantly include with a package manager, where instead I copied the relevant source code and license.
Thus, those parts of the code are governed under a different license, as specified in their respective files.
