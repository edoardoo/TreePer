
![TreePer Logo](/icons/icon128.png) **TreePer**

### A WebGL Youtube Visualizer  
![TreePer Demo](demo.gif)  


This is a little, quick and dirty project.  
I've integrated the work of [Yannis Gravezas](http://github.com/wizgrav/clubber) inside YouTube using a Chrome extension to avoid CORS and TOS violations.

### Usage

Just click the tree icon that appears on the youtube player controls bar.  
You can also use other keyboard controls.   

### Controls

| Button | Action |
| --- | --- |
| `[` or `-` | Decrease video opacity (animation will start automatically) |
| `]` or `+` | Increase video opacity (animation will stop automatically)|
| `b` or 'B' | Previous shader |
| `n` or 'N' | Next shader |


### Sharing

TreePer comes with the possibility to share the visualization with your friends by sharing the youtube url in the location bar. Same shader and opacity will be applied.


### Shaders  
I didn't produce any of the shader you see, and I'll provide on app credit to the authors as soon as I can. I didn't touch their code so you might find all the author's informations inside.   
I would like to add some other shaders.  
Feel free to fork and add/edit (look around the web for WebGL Shaders).   
Don't forget to send a PR.  

### Credits  
Soon I'll find a way to put the credits of all the shaders authors (directly in app). I'm sorry for now.

### FAQ


- `I don't see anything, what's wrong?`   
  First, as always, refresh youtube page. Then, if problem persists, check the console for errors and send it on github, or (better) work on it.
- `Can I stream it to chromecast?`   
  Only if you stream the entire tab, which I don't think it's gonna be easy on youtube because of the tight relationship between the two.
- `Can you implement this and that feature?`  
  I may, but I can't. This was just a weekend project. If I like the feature you suggest and I have time I might do it.
  Anyway, you're free to take the code and edit. Just remember to submit a pull request.
- `It's a bit laggish, is this normal?`   
  I didn't optimise the shaders nor the engine. Maybe it can go smoother.
- `Is there a mobile app?`   
  No, for one reason: YouTube's terms of service. To make the animation TreePer analyze audio stream or video stream in real time. Since I'm not Mr YouTube, usually requesting direct resources from youtube generate random CORS (which means the YT server is telling me `What the hell do you think you're doing with my stuff?`).  
  **That said**, if you find a **legal** way feel free to suggest it through the issue system.



### License

This program is free software and is distributed under an [MIT License](https://github.com/wizgrav/clubber/blob/master/LICENSE).

** :beer: Disclaimer :beer:**  
This is probably the dirtiest code you'll read today, but it works, maybe.  

Also, if you find yourself staring at this thing for hours, remember that I'd like [a good frozen :beer:](https://paypal.me/edoardoo/5) ...
