Every item needs to be able to report this overall shape
that shape is then put in the overlay layer
anytime one of those shapes is touched it reports that the underlaying item
is selected.
this allows group levels to be "focusable" so that no items above or below that
group level can be selected
The selection tool can then sum up the overall shapes to handle visualizing the
selection.

OR

Just use the shapes themself as the selection handles. When an item is selected,
the item is compared against the ceiling item. An item is selected if it is a
child of the ceiling item. By default the project is the ceiling item.
Overlay handles have precedent over shapes which has precedent over the background.

First, set a ceiling item and report child item of it when a child (or itself) is
selected.
