# The Sommus Project

##History:

### 2016-05-06

* Added Multi-Piped filters. You can now daisy-chain filters.

### 2016-05-05

* Added initial code to use styles on a per template basis.
* Added more unit testing for the parsing of templates and styles.

### Pre May 2016

Everything else

---

## TODO:

* Only allow one direct child element inside a template?
* Should I require a template `type` attribute and only allow attributes to copy on HTML or XML types
* Copy all attributes cross from tag to top level child/children in template
* Need to add `sommus-tag="tagName"` to top level child/children in template
* Insert used styles into the HTML output.
* Figure out a place to insert the used styles.
* Finish testing for the main `index.js` file
* Preload all templates/controllers so the list of files is defined
* Watch folders for templates/controllers for changes.
* Change controllers to use http verbs: `get`, `post`, etc.
* Change controllers to allow definition of additional parameters on URL `/page/:var1/:var2`, etc.


#### Finished

* Transclusion - _done_
	* `<content>` - _done_
	* `<content selector="something">` - _done_
* Change all element CSS in the `styles` variable to include `[sommus-tag="tagName"] old` and `[sommus-tag="tagName"]old` - _Done 2016/05/05_
* Multi-Piped Filters - _Done 2016/05/06_


### Lang system

* Provide a default language system that just reads `.json` Filters
* Provide a way to replace the language system per compiler.
* Initial code is called to init the system. This needs to provide a valid/preference/fallback list.
* `getLocaleStrings(locale)` will return the correct locale strings based on incoming `locale` parameter


## Future ideas

### Step 1

* Pre compile from templates/elements into JSON structure
* Add watch on the files to reload on change.


### Step 2

* Pre compile from templates/elements into JavaScript
