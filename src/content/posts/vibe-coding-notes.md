---
title: Vibe coding notes
date: 2026-01-20
lang: en
tag: eng
read: "7 min"
abstract: >-
  I tried letting AI write almost all the code in a few small projects. It worked surprisingly well, until it didn't... These are some notes on what I learned.
---

I have been using AI to write more and more code recently. Not just autocomplete. I mean the real "vibe coding" style: describe what you want, let the model change the code, run it, complain, and repeat.

It is quite amazing. The biggest change for me is not that I type faster. It is that I can now build things that I would probably not bother to build before. But after using it on several real projects, I also found something interesting.

The hard part slowly moves. Writing code becomes cheaper. But deciding what the code should do, what should not change, and whether the result is actually correct becomes more important. So I started thinking about a simple question:

> How much control should I give to the model?

I tried a few small projects to find out. My rule was simple: **write as little code myself as possible.** I would describe requirements and bugs. The model would write and debug the code. Then I watched where things started to break.

## 1. Refactoring my resume

Repo: [yuan2-resume](https://github.com/eugenejyuan/yuan2-resume/).

This started from a very normal problem. I wanted to update my resume. I found a LaTeX template I liked, [yuan-resume](https://github.com/xyz-yuanhf/yuan-resume), and started using it. The design was nice. But after using it for a while, I found some parts hard to maintain. There were spacing hacks and magic numbers. Some macros were also too specific. I wanted cleaner and more reusable interfaces. This sounded like a perfect AI task. My first prompt was roughly:

```text
Based on this template, reduce magic-number spacing hacks,
use modern LaTeX packages, and expose clean, general interfaces.
```

The result was... not great. The model could always write something. This was almost the problem. As the refactoring continued, the code became bigger and more complicated. It was moving in the opposite direction from what I wanted. 

I also found that "make the abstraction better" is not a very useful instruction. The model does not know what I mean by "better". Should this behavior be configurable? Should two macros become one? Which detail should be hidden? Which interface should stay stable? These were actually the important decisions.

In the end, I changed the way I worked. I designed the interfaces myself. I told the model exactly what behavior I wanted. I also told it what should not change. After that, it became much better. The model was good at filling in the implementation. But I had to define the abstraction first. 

This was my first lesson:

> I can delegate implementation much more easily than I can delegate intent.

## 2. Building the CryoFM project page

Site: [cryofm](https://bytedance-seed.github.io/cryofm/).

Web development is not my comfort zone. So naturally, I decided this was a good place to let AI suffer for me. I used [Astro](https://astro.build/) and started from the [ricoui-portfolio](https://github.com/ricocc/ricoui-portfolio) template. Most of the work was done in Cursor. 

For this kind of task, AI was very useful. I could say:

- change this text;
- move this section;
- make the theme darker;
- fix the mobile layout.

Cursor could usually find the right files and make the changes. I did not need to understand every frontend detail. This saved me a lot of time. But one small problem got stuck for a surprisingly long time. I wanted to show a pseudo-code block in a blog post. It had line numbers on the left and code on the right. The alignment was wrong.

I explained the problem. Still wrong.

I explained it in more detail. Still wrong.

I even gave it a screenshot. Still wrong.

At some point, I realized I was doing the wrong thing. I was trying to make the model understand my current implementation better. But I did not actually care about the implementation. I only cared about the final layout. So I changed the problem:

```text
Do this as a two-column table.

The first column is line numbers.
The second column is code.
```

It worked almost immediately. This was probably my favorite lesson from the whole experiment. When prompting does not work, the answer is not always a longer prompt. Sometimes the problem itself is in a bad form. Change the representation. Change the structure. Make the desired behavior easier to express.

In other words:

> Sometimes the best way to prompt better is to stop prompting and redesign the problem.

This feels less like "prompt engineering" to me. It is just normal problem solving.

## 3. Rebuilding my personal site

Later I rebuilt this personal site with the [Pure](https://github.com/cworld1/astro-theme-pure) theme.

I used GPT-5.2 Codex through Cursor. For frontend design, it was better than I expected. I am not very good at web design, and I usually make very safe choices. The model was actually more willing to try things. The homepage design came out quite nice.

But I also found another type of failure. I wanted the publication cards to have the same background effect as the blog cards. Transparent background, gradient, same visual feeling. The effect already existed in the codebase. I basically wanted: "copy this exact thing over there." That sounds easy. It was not. I asked several times. The result was always close, but not really the same. Then I stopped asking the model to implement it. Instead, I asked:

> Show me where each visual effect is implemented.

This worked very well. It found the relevant styles and components. Then I copied and aligned them myself.

This changed how I think about AI coding. When the model is bad at one role, I do not have to completely take the task back. I can change its role. Instead of `implement this`, I can ask: `find this` or `explain this` or `compare these two implementations` or `show me which files control this behavior`. 

The model can be a code generator. But it can also be a very fast navigator. Sometimes the second one is more useful.

## 4. Where should the control boundary be?

After these projects, I no longer think "small tasks for AI, large tasks for humans" is the right rule. Task size is not the main problem. The more useful question is:

> How easy is it for me to verify the result?

For a personal website, I can give the model quite a lot of freedom. If the page looks wrong, I can see it. If it breaks, I can revert it. The feedback loop is fast and cheap.

Research code is different. The code may run normally and still be wrong. A tensor can have the correct shape but the wrong meaning. A refactor can change some numerical behavior without an obvious error. The final problem may only appear after a long experiment. So I am much more careful there.

This is now how I think about the control boundary. If something is easy to check and easy to undo, I can let the model do more. If something is hard to verify, has hidden effects, or is expensive to recover from, I want to keep more control. The boundary can also move. Sometimes I define only the final requirement and let AI handle everything.Sometimes I define the interface and let AI implement it. Sometimes I ask AI to write only one function. And sometimes I only ask it where the relevant code is.

There is no fixed "correct" level. The useful skill is knowing where to put the boundary.

## 5. What I learned

AI has made me much more productive as a solo developer. But not because I stopped thinking. Actually, I think the opposite happened.

As implementation became cheaper, I had to spend more attention on other things:

- What do I actually want?
- What constraints matter?
- What should stay unchanged?
- Can I verify the result cheaply?

I still write much less code than before. I think this is good. Typing code was never the most interesting part anyway. But I also trust generated code less than the amount of code I generate. Maybe that is also good. The model can produce a lot. My job is to decide what is worth producing, what I should trust, and where I still want my hands on the steering wheel. For now, that feels like a reasonable way to vibe code.
