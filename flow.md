# Application Flow

* Data Store (items stored by ID)
* Transformed into
* Timeline (each frame is presented in a tree node structure)
* Displayed the current frame


## Time Line
The timeLine is an array that contains all items at each point in time. The array
is just as long as there are frames in the scene.

frame and item objects can be shared to minimize object counts

Any changes to the timeline cause objects to be cloned

each frame has a frame number that it as created on so that when a frame is changed
we know to update all frames after it upto a point that the frame number is different

The timeLine is generated from the dataStore.

it should render the disposition of all items in the frame


An item contains shapes (groups, polygons, rectangles, ...) but a shape does not
have to be an item. The item designation is just a marker for reference

maintain an array of frames with that can lookup the items by ID

if we have to make a change clone the object
build/rebuild the timeLine forward from any point
items are always referenced in the nodes of an item so addressing is easy (parent and node position)

if node object passed in contains a frameNumber lower than current frame pull from cache (repeat)
One node does not depend on another node so each can be built independently
don't fill in references, all we need to do is expand the objects on the timeLine
So the timeline is just an array of time with each frame being an object of
ID keys and fully materialized items. The items have id strings as references
or none IDed items
Items must always exist in time, so not having a timeLine is not an option
