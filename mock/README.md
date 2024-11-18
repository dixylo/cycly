# How to populate the database

## Use Collection Runner to batch-save instead of saving data items one by one in Postman.

1. Log into Postman to use saved requests.
2. In My Workspace, which is on the left of the Postman UI, click "Collection" to view all collections. Find "Cycly" and move cursor over the collection name. Click the three dots to display a menu. Click "Run collection" to open a runner tab.
3. Deselect all requests if they are selected by default. Then select the request for batch-sending.
4. Click "Select File" under "Run configuration" on the right of the tab, and choose the JSON file where an array of data items in a request-body format is saved.
5. Click the orange "Run Cycly" button. (The configurations of all batch requests, e.g. request body, pre-request script, etc., have been all set up.)

## Data-creating order

1. Create an administrator first because creating other entities requires a token and admin authorization.
2. Create brands and types first as models need their IDs.
3. In models.json, Find the brand and type names of a model in the last part of a model image URL to find out the corresponding brand and type. Replace "brandId"s and "typeId"s with the IDs in the saved brands and types data. Create models with the updated models.json file.
4. Create cycle data freely since a cycle doesn't have any real-world properties (No model has specified its color or size). It is very easy to use AI to create the data. Currently, a model has 6 cycles, each of which has a unique color from red, green, blue, black, gray, and white, and a size of small, medium, and large (Each size has 2 cycles).

In summary, the data-creating order is "admin -> brands + types -> models -> cycles". No more entities need creating ahead of time.
