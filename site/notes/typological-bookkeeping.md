---
status: ready
tags: [math, type-theory, sets, essay]
---

# Typological Bookkeeping

Not about the typology of bookkeeping (though that's interesting in its own
right, what with immutability and "corrective" entries, since accountants don't
use erasers)…

But the _bookkeeping of typology_. Keeping the books on types — tallying what a
type can _be_, and how many ways it can be it.

Typology vs. morphology: an analogy with nominal vs. structural typing?
Intensional vs. extensional? Hierarchical _place_ vs. _shape_? A nominal type is
what it's _declared_ to be — identity by name, by fiat, by where it sits in a
hierarchy. A structural type is what it's _made_ of — identity by shape, by the
slots it exposes. The distinction earns its keep here because it decides whether
you can even _count_ a type. Structural types you can enumerate: just tally the
configurations of their parts. Nominal types resist it — their identity is a
name someone assigned, and names don't multiply into a lattice you can walk.

So let's count the things we _can_ count.

## Enumerating options

Say a company wanted to declare an enumeration to the world. PizzaCo wants to
declare the toppings it will make a pizza with:

- pepperoni
- sausage
- cheese

Though — is cheese really a topping? Or is that just the default state? If you
order a "plain" pizza, would anyone expect it to come without cheese? Nope —
that's a state you have to explicitly opt _in_ to.

Better example: let's just take `a, b, c`. One could declare some "set" of
options. The space of states, in different circumstances:

- If only one must be selected — **3**: `{a}, {b}, {c}`
- If zero or one can be selected — **3 + 1**: `{}, {a}, {b}, {c}`
- If any can be selected — **2³**: `{}, {a}, {b}, {c}, {a,b}, {b,c}, {c,a}, {a,b,c}`
  - assuming the order of selections doesn't matter

## Every policy is a number system

Look at what those counts actually are. Fix a set of `n` options and vary the
_policy_ — the rule for how many of each you're allowed to take — and each
policy turns out to be a different number system:

| Policy                      | Count over `n` options | Number system                        |
| --------------------------- | ---------------------- | ------------------------------------ |
| Exactly one                 | `n`                    | a single base-`n` digit              |
| Zero or one                 | `n + 1`                | a base-`n` digit plus a "none" state |
| Any subset (each in or out) | `2ⁿ`                   | `n` binary digits — the power set    |
| Multiset, ≤ `k` of each     | `(k+1)ⁿ`               | `n` digits in base `k+1`             |
| Multiset, unbounded         | —                      | `n` digits in base ∞                 |

The power-set row is the one everyone meets first: each option is a bit, present
or absent, so a subset is just an `n`-bit binary number. Bump the allowed
multiplicity from 1 up to `k` and you've bumped the base from 2 up to `k+1`. Let
multiplicity run off to infinity and the base runs off with it.

Which finally clears up an "off by one" that always nagged me. The _base_ counts
the values a single slot can hold — `0` through `k` is `k+1` values, hence base
`k+1`. The _multiplicity_ — how many copies you may take — is `k`, one less.
They're not the same number, and were never meant to be: one is a cardinal (how
many distinct symbols a slot has), the other is the largest value a symbol can
carry. Push multiplicity to "unbounded" and the base stops being a finite
cardinal at all — it becomes the first thing past every finite one. A [limit
ordinal](https://en.wikipedia.org/wiki/Limit_ordinal). Base ω. (The _other_ knob
— varying the number of options rather than the multiplicity — is the more
familiar one, and easy enough to characterize. But I digress.)

## Indexing the power set

Let's call this set _Z_. Assuming the elements of _Z_ can be put into a
well-defined order, you might "index" them with natural numbers:

- *Z*₁ := a
- *Z*₂ := b
- *Z*₃ := c

This extends naturally to all 2³ elements of the power set of _Z_: treat each
element as a "bit" of a binary number — each place value (a power of 2)
associated with a particular element of _Z_, and each coefficient marking the
presence (1) or absence (0) of that _Z_-element in the subset being represented.
The subset _is_ the number; the number _is_ the subset. Bookkeeping in the most
literal sense — a ledger where every column is an option and every row is a bit.

## Constructors

If you wanted to "construct" a value of _Z_ — to _represent_ a specific element
in _Z_ — you might do something like this (using some made-up lispy s-expression
form): `(Z, 3)`, which might evaluate to `c`. Though maybe it's better to think
in terms of representing the _set of_ elements. Then: `(Z, 0, 0, 1)`.

Interesting thought experiment: what if you wanted to augment your "constructor"
to control whether or not you can construct the set itself? The "fully
populated" set, plus the constructor itself? A set of all sets, à la [Russell's
paradox](https://en.wikipedia.org/wiki/Russell%27s_paradox).

And that's the crack the whole note has been creeping toward. Counting
configurations works beautifully — right up until the configuration you want to
count is "all configurations, including this one." The structural view, identity
by shape, describes the parts without complaint; it chokes only when you ask it
to contain itself. Which is precisely where the nominal view earns its keep:
sometimes the only way to pin a thing down is to _declare_ it, from outside, and
refuse to let it swallow its own definition. The books have to be kept by
someone who isn't an entry in them.
