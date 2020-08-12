# How to add a new translation to the viewer or improve an existing one

If you want to add one more translation to the viewer, 
you need to fulfill the following steps:

1. Copy [the Russian dictionary file](viewer/src/locales/Russian.js) and rename it
according to the name of your language in English.

2. Then change all the Russian translations of English phrases with your own. 
You can look at the  [the English dictionary file](viewer/src/locales/English.js), 
which essentially does not translate anything. But it may serve you as an additional example.

3. Pay attention to **the topmost comments** in the Russian dictionary file. 
Especially, read about placeholders which start with #, e.g. #helpButton.
Other comments throughout the file will help you to find where a phrase is used in the app.
Some phrases you will not see if you start the viewer locally (not as in the extension).
While others you can see only if you remove some phrases from a dictionary
(namely notifications that the translation isn't complete), and start the viewer locally (it's written in [README](README.md) how to do it).
But you do not need to find all phrases, you can translate some of them blindly.

4. If you want to **improve an existing translation**, the notification window should have
told you what phrases are missing. So find where those phrases are placed in the Russian 
dictionary and add them with translations to the dictionary you want to improve.

You do not need to connect the dictionary to the code, I will do it myself. 
However, if you want you can find where it's connected in the code and add it there.
**But in general you need only to create a dictionary and nothing more.**

It's better to create **a pull request on GitHub**, but if you do not know how to do it, and do not 
want to learn how to do it, you can just send the dictionary at djvujs@yandex.ru and I will add it
to the project myself.
