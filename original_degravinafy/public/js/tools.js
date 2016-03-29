var _ = (function brockEvents () {
  "use strict";

  var OVERHEAD_FUNCS = {
    build: function (obj, prototype) {
      for (var x in prototype) {
        /** iterate through prototype object. **/

        if (prototype.hasOwnProperty(x)) {
          /** ensure with Object.hasOwnProperty that it is an object property. **/

          obj[x] = prototype[x];
          /** assign property to object. **/
        }
      }

      return obj;
      /** return the object. **/

      /** -----
      @param : obj - the object to add prototypes to.
               prototype - the object of prototype features to add.
      @desc  : Add a list of prototype functions to an object/function.
      ----- **/
    },

    serialize: function (obj) {
      var string = "";
      /** initialize empty string **/

      for (var x in obj) {
        /** iterate through object. **/

        obj[x] = (typeof obj[x] === "object") ? JSON.stringify(obj[x]) : obj[x];
        /** if the property is of object type, stringify it. **/

        obj[x] = encodeURI(obj[x]);
        /** encode the value to URI so that it is address bar safe. **/

        string += x + "=" + obj[x] + "&";
        /** add var=value& for each object property. **/
      }

      return string.slice(0, string.length - 1);
      /** return the string without the last & char. **/

      /** -----
      @param : obj - an object of data to be stringified.
      @desc  : Stringify an object to send across as [GET/POST] data.
      ----- **/
    }
  };

  var DOM = function (sel) {
    var INTERNAL = {};

    INTERNAL.sel = (function () {
      if (typeof sel === "string") {

        var nodeList = document.querySelectorAll(sel);
        /** if string, use querySelectorAll to create a nodeList. **/

        return Array.prototype.slice.call(nodeList);
        /** return an array of nodes instead of a nodeList. **/

      } else if (sel instanceof HTMLElement) {

        return [sel];
        /** if the selector is a node, just pop it into an array. **/

      } else if (Array.isArray(sel)) {

        return sel;
        /** if the selector is an array, just keep it as is. We assume
           this is an array of nodes. **/

      } else {

        throw "Error. This is not a proper selector type.";
        /** if any other datatype (eg. Bool, Number), throw an error. **/

      }
    })();

    INTERNAL.loop = function (callback) {
      for (var x = 0; x < INTERNAL.sel.length; x++) {
        callback(INTERNAL.sel[x], x);
        /**
          @param : node - This is the node in the selector list.
                   position - This is the node position in the query.
        **/
      }
    };
    /** loop through all nodes and give a callback for each node. **/

    INTERNAL.first = function () {
      return INTERNAL.sel[0];
    };
    /** return just the first element in the node list. **/


    /** the purpose of .each is to use when the functions only apply to one node.
       so things like .parent() should only apply to one node. **/

    var prototype = {

      addClass: function (className) {
        var classes = INTERNAL.first().className.split(/ /);

        if (classes.indexOf(className) === -1)
          classes.push(className);
        /** check if className exists in classes array, and if not, push the
           className to classes array. **/

        INTERNAL.first().className = classes.join(" ");
        /** set as first element's className the joined version of the array. **/

        return this;

        /** -----
        @param : className - the name of the class you want to add.
        @use   : single element.
        @desc  : Add a className to one node.
        ----- **/
      },

      append: function (node) {
        if (node instanceof HTMLElement)
          INTERNAL.first().appendChild(node);
          /** if a valid HTML Element, then append the child to the parent. **/
        else
          throw "Error. This is not a proper HTML Node type.";
          /** if not, throw error saying you must use valid HTML Element. **/

        return this;

        /** -----
        @param : node - a valid HTML Element.
        @use   : single element.
        @desc  : Add a valid HTML Element to a single parent element.
        ----- **/
      },

      attr: function (attr, value) {
        if (!value) {
          /** if the value @param doesn't exist, then assume it is a query to
             retrieve the value of an attribute. **/

          return INTERNAL.first().getAttribute(attr);
          /** return the value of the given attribute for the first node. **/

        } else {
          INTERNAL.loop(function (i) {
            /** loop through all selector nodes. **/

            i.setAttribute(attr, value);
            /** set the value for tha attribute for each node. **/
          });
        }

        return this;

        /** -----
        @param : attr - the selected attribute to either query or set.
                 value - [optional] when setting the value of an attribute.
        @use   : single element for query, multiple elements for command.
        @desc  : Set attribute with value for list of nodes or query the first
                 node's attribute value.
        ----- **/
      },

      children: function (sel) {
        var children = DOM(sel);
        /** get a general selection of all children with selector type. **/

        var validChildren = [];
        /** initialize array for filtered, valid children. **/

        children.forEach(function (i) {
          var pointer = i;
          /** the pointer is the current element in the chain from
             i -> i.parentNode -> i.parentNode.parentNode... **/

          while (i) {
            /** while i isn't null. **/

            pointer = pointer.parentNode;
            /** set pointer to the parentNode **/

            if (pointer.isSameNode(INTERNAL.first())) {
              /** if the pointer is equal to the parent selector **/

              validChildren.push(i);
              /** this means it is a deep/direct child to the parent, so push
                 it to the validChildren array. **/

              break;
              /** end the while loop **/
            }
          }
        });

        return DOM(validChildren);
        /** return all valid children in a DOM query type. **/

        /** -----
        @param : sel - The selector of the child type you want to retrieve.
        @use   : single element.
        @desc  : Return all child nodes of any parent of a selector type.
        ----- **/
      },

      click: function () {
        INTERNAL.first().click();
      },

      css: function (attr, value) {
        if (typeof attr === "object") {
          /** if it is an object, it will be in the format of having multiple
             attrs and values to iterate through. **/

          INTERNAL.loop(function (i, o) {
            /** loop through all selector nodes. **/

            for (var x in attr) {
              /** iterate through attributes. **/
              if (attr.hasOwnProperty(x)) {
                /** ensure with Object.hasOwnProperty that it is an object
                    property. **/

                i.style[x] = attr[x];
                /** set style[x] equal to the attr[x] (value). **/
              }
            }

          });

        } else if ((typeof attr) === (typeof value)) {

          INTERNAL.loop(function (i, o) {
            /** loop through all selector nodes. **/

            i.style[attr] = value;
            /** set i.style[attr] equal to the value. **/

          });

        }

        return this;

        /** -----
        @param : attr - if a string, then it is for the attribute. If an object,
                 no value @param should be present.
                 value - the CSS value (only use if not object form).
        @use   : multiple elements.
        @desc  : Allow users to set CSS settings for elements.
        ----- **/
      },

      each: function (callback) {
        INTERNAL.loop(function (i, o) {
          /** loop through all selector nodes. **/

          callback.call(i, o);
          /** a callback where thisArg is the node so you can access with
          _(this) format. **/
        });

        return this;

        /** -----
        @param : callback - a callback function with thisArg of each node.
        @use   : single element.
        @desc  : Allow users to repetitively use internal functions by cycling
                 through node list with a callback.
        ----- **/
      },

      el: function (func) {
        if (typeof func === "function") {
          /** if @param func type is function, run the filter to filter by the
             func specifications. **/

          var selection = INTERNAL.sel.filter(function (i, o) {
            return func.call(i, i, o);
            /** return a callback with the element and index to filter by. Use
               call to pass a thisArg of the node. **/
          });
          /** filter by func specifications. **/

          return DOM(selection);
          /** return a DOM query of the selection remaining. **/

        } else if (typeof func === "number") {
          /** if the type is number, select the given index. **/

          if (INTERNAL.sel[func])
            return DOM(INTERNAL.sel[func]);
            /** return a DOM query of the element selected. **/
          else
            throw "This element index does not exist.";
            /** if the index is null/undefined, throw error instead of query. **/

        } else {
          throw "Error. Please use a callback function or select and index.";
          /** if not a number or function, throw error for invalid query. **/
        }

        /** -----
        @param : func - a selecting method -- either a number or determining
                 function callback.
        @use   : filter elements by method [return single or multiple].
        @desc  : Filter elements by index number or by a function method.
        ----- **/
      },

      html: function (html, append) {
        if (!html) {
          /** if the html @param is empty, then return the contents because this
             is now a query, not a command. **/

          return INTERNAL.first().innerHTML;
          /** return the first element's innerHTML. **/

        } else {
          INTERNAL.loop(function (i) {
            /** loop through all selector nodes. **/

            i.innerHTML = (append) ? i.innerHTML + html : html;
            /** if append is true, node.innerHTML should append html, else set
               to the html contents. **/
          });
        }

        return this;

        /** -----
        @param : html - a string of html.
                 append - [optional] boolean to allow option of appending to
                 html.
        @use   : single element for query, multiple elements for command.
        @desc  : Add a string of html to all nodes or query first element's
                 innerHTML.
        ----- **/
      },

      on: function (event, callback) {
        INTERNAL.loop(function (i) {
          i.addEventListener(event, function (e) {
            callback.call(e.target);
          });
        });

        return this;

        /** -----
        @param : event - This is a string arg of the event type to trigger the
                 callback function.
                 callback - This is a callback function to happen on event
                 trigger.
        @use   : multiple elements.
        @desc  : Add an event listener with callback.
        ----- **/
      },

      parent: function () {
        return DOM(INTERNAL.first().parentNode);

        /** -----
        @param : none
        @use   : single element.
        @desc  : Get the parent node of the first selection.
        ----- **/
      },

      prepend: function (node) {
        var firstChild = INTERNAL.first().firstChild;
        /* get the first child of a parent div. */

        INTERNAL.first().insertBefore(node, firstChild);
        /* insert before the first child of the parent div. */

        /** -----
        @param : node - a valid HTML element.
        @use   : single element.
        @desc  : Add a valid HTML Element to the beginning of a single element.
        ----- **/
      },

      remove: function () {
        var first = INTERNAL.first();
        /** make reference of INTERNAL.first() so we don't need to call twice. **/

        first.parentNode.removeChild(first);
        /** first -> parentNode -> remove child = remove first. **/

        INTERNAL.sel.shift();
        /** remove first from the INTERNAL.sel node list. **/

        return DOM(INTERNAL.sel);
        /** return a DOM query of INTERNAL.sel without the first element. Equiv
           to returning this - first element. **/

        /** -----
        @param : none
        @use   : single element.
        @desc  : Remove the first node and return a query of all elements
                 excluding the removed node.
        ----- **/
      },

      removeClass: function (className) {
        var classes = INTERNAL.first().className.split(/ /);

        var classIndex = classes.indexOf(className);
        /** get the index of the className **/

        if (classIndex > -1)
        /** if classIndex exists...  **/
          classes.splice(classIndex, 1);
          /** return the array without the classIndex index. **/

        INTERNAL.first().className = classes.join(" ");
        /** set as first element's className the joined version of the array. **/

        return this;

        /** -----
        @param : className - the name of the class you want to remove.
        @use   : single element.
        @desc  : Remove a className to one node.
        ----- **/
      },

      text: function (text, append) {
        if (typeof html === "undefined" || html === null || html.length === 0) {
          /** if the html @param is empty, then return the contents because this
             is now a query, not a command. **/

          return INTERNAL.first().innerText;
          /** return the first element's innerHTML. **/

        } else {
          INTERNAL.loop(function (i) {
            /** loop through all selector nodes. **/

            i.innerText = (append) ? i.innerText + html : i.innerText;
            /** if append is true, node.innerHTML should append html, else set
               to the html contents. **/
          });
        }

        return this;

        /** -----
        @param : text - a string of text.
                 append - [optional] boolean to allow option of appending to
                 html.
        @use   : single element for query, multiple elements for command.
        @desc  : Add a string of text to all nodes or query first element's
                 innerText.
        ----- **/
      },

      val: function (value) {
        if (!value) {
          /** if the value @param is empty, then return the contents of the elem
             value. **/

          return INTERNAL.first().value;
          /** return the first element's value. **/

        } else {
          INTERNAL.loop(function (i) {
            /** loop through all selector nodes. **/

            i.value = value;
            /** set each node value equal to the value @param. **/
          });
        }

        return this;

        /** -----
        @param : value - [optional] value to set into each node.
        @use   : single element for query, multiple elements for command.
        @desc  : Add a value to a list of nodes or query the first node's value.
        ----- **/
      }
    };
    /** this is a list of all functions that the selectors can access. **/

    var returnFunctions = INTERNAL.sel;
    /** this is the object that we will return. This should be in array format
       so that it can be easily looped through if users just want to loop
       through selected node list. **/

    OVERHEAD_FUNCS.build(returnFunctions, prototype);

    return returnFunctions;
    /** return the returnFunctions that includes an array of nodes along with
       all internal functions they can access. **/
  };

  var outer_prototype = {
    ajax: function (obj) {
      var xhttp = new XMLHttpRequest();
      /** create a new request. **/

      var data = OVERHEAD_FUNCS.serialize(obj.data);
      /** change the data into http address format ?var1=x&var2=y... **/

      if (obj.type.toLowerCase() == "get" && data) {
        /** if the type is GET.. **/
        obj.url += "?" + data;
        /** add the serialized object data to the end of the address line. **/
      }

      xhttp.open(obj.type, obj.url, true);
      /** open a connection of obj.type [GET/POST], obj.url [PATH] **/

      xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded" || obj.contentType);
      /** set a request header type form. **/

      xhttp.send(data);
      /** send the POST data or null. **/

      xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          var error, response;

          try {
            if (obj.dataType) {
              response = (obj.dataType.toLowerCase() === "json") ?
                JSON.parse(xhttp.response) : xhttp.response;
            } else {
              response = xhttp.response;
            }
            /** if the dataType is JSON, parse before returning. **/
          } catch (err) { error = err; }
          /** if dataType was supposed to be JSON but wasn't, set error to the
             caught parse error and pass to the callback. **/

          obj.callback(response, error);
          /** execute object callback with @params response and
             [optional] error. **/
        }
      };

      /** -----
      @param : obj - an object with types:
                 type     : [GET/POST],
                 data     : Object of data to send.
                 url      : Valid HTTP url to send to.
                 callback : a function callback with @params results and error.
                 dataType : [Optional] "JSON" to auto parse JSON results.
      @desc  : An AJAX function that accepts GET and POST and posts a callback
               function with the data recieved.
      ----- **/
    },

    jsonp: function (url, callback) {
      var callbackName = "callback_" + parseInt(Math.random() * 1E10, 10);
      window[callbackName] = function (data) {
        callback(data);
        setTimeout(function () {
          delete window[callbackName];
        }, 10);
      };

      var script = document.createElement("script");
      script.src = (/\?/.test(url)) ? url + "&callback=" + callbackName : url + "?callback=" + callbackName;

      document.body.appendChild(script);
    },

    create: function (nodeSettings) {
      if (!nodeSettings) nodeSettings = {};
      /** if nodeSettings is undefined, just create an empty object. **/

      var node = document.createElement(nodeSettings.tagName || "div");
      /** if no tagName defined, create a DIV. **/

      for (var x in nodeSettings) {
        /** iterate through nodeSettings. **/

        if (nodeSettings.hasOwnProperty(x)) {
          /** if not an Object.prototype property. **/

          if (/innerHTML|className/.test(x)) {
            node[x] = nodeSettings[x];
            /* because innerHTML isn't an atribute. */

          } else if (x !== "tagName") {
            node.setAttribute(x, nodeSettings[x]);
            /** add property to the node. **/

          }

        }
      }

      for (x in nodeSettings.style) {
        /** iterate through nodeSettings CSS style properties.
            x is already defined. **/

        if (nodeSettings.style.hasOwnProperty(x)) {
          /** if not an Object.prototype property. **/

          node.style[x] = nodeSettings.style[x];
        }
      }

      return node;

      /** -----
      @param : obj - an object with all properties to add to a node.
      @desc  : Create an element node with JSON defined properties.
      ----- **/
    },

    filterEmpty: function (arr) {
      return arr.filter(function (i) {
        return i;
      });
    },

    get: function (url, callback) {
      this.ajax({
        type      : "GET",
        url       : url,
        callback  : callback
      });

      /** -----
      @param : url - a valid url for the ajax request
               callback - a callback function with @param response.
      @desc  : A quick call that uses the internal ajax function to execute.
      ----- **/
    },

    quote: function (ticker, callback) {
      if (Array.isArray(ticker))
        ticker = ticker.join(",");

      var url = "http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes where symbol in ('" +
      ticker + "')&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json";
      /* the yahoo finance quote string with the variable embed. */

      this.get(url, function (data, response) {
        /* use the internal 'get' function. */

        try {
          data = JSON.parse(data).query.results.quote;
          /* attempt to get the quote (enum list of attr). If it doesn't exist
             then the query returned false, and the ticker is likely invalid. */

        } catch (err) { throw "This ticker is invalid."; }

        callback(data);
        /** throw a callback with @param data. **/

      });

      /** -----
      @param : ticker - a valid comma-seperated string of tickers or array.
               callback - a callback function with @param data.
      @desc  : A quick call function to the Yahoo! Finance API to retrieve
               current stock information for a list of tickers.
      ----- **/
    },

    news: function (query, start, callback) {
      this.ajax({
        type: "POST",
        url: "../personal/tools/tools/deps/google_news.php",
        data: {
          query: query,
          start: start,
        },
        callback: function (data) {
          callback(data.responseData);
        },
        dataType: "json"
      });
    },

    newsList: function (query, num_results, callback) {
      var news_results = [];

      function search(x) {
        _.news(query, x, function (data) {
          news_results = news_results.concat(data.results);

          if (x < num_results - 4) {
            search(x + 4);
          } else {
            callback(news_results);
          }
        });
      }

      return search(0);
    },

    moment: function () {
      var date = new Date();
      return {
        d: date.getDate(),
        m: date.getMonth() - 1,
        y: date.getFullYear(),
        h: date.getHours(),
        mm: date.getMinutes(),
        s: date.getSeconds(),
        ms: date.getMilliseconds(),
        fmt: {
          d: ("0" + date.getDate()).slice(-2),
          m: ("0" + date.getMonth()).slice(-2),
          y: ("0" + date.getFullYear()).slice(-2),
          h: ("0" + date.getHours()).slice(-2),
          mm: ("0" + date.getMinutes()).slice(-2),
          s: ("0" + date.getSeconds()).slice(-2),
          ms: ("000" + date.getMilliseconds()).slice(-3),
        }
      };
    },

    finance : {
      assetReturn: function (iv, pv, t) {
        return Math.pow(pv / iv, 1 / t) - 1;

        /** -----
        @param  : iv - the initial value of the asset.
                  pv - the present value of the asset.
                  t - the time in years held.
        @desc   : Get the annualized return of an asset.
        @return : returns a number.
        ----- **/
      },

      futureValue: function (pv, ir, t) {
        var total_interest = Math.pow(ir + 1, t);
        /* calculate compounded interest over t(years). */

        return pv * total_interest;

        /** -----
        @param  : pv - the present value of the asset.
                  ir - the interest rate expected (in decimal).
                  t - the time in years held.
        @desc   : Get the future value of an asset with a given interest rate.
        @return : returns a number.
        ----- **/
      },

      mortgagePayment: function (p, ir, t) {
        ir /= 12;
        /* reduce the interest rate to monthly terms. */

        t *= 12;
        /* increase time to monthly terms from yearly. */

        return p * ir / (1 - Math.pow(1 + ir, -t));
        /* mortgage formula. */

        /** -----
        @param  : p - the principle owed.
                  ir - the interest rate expected (in decimal).
                  t - the time in years held.
        @desc   : Get the payment on a principle owed.
        @return : returns a number.
        ----- **/
      },

      sharpeRatio: function (ar, rfr, av) {
        return (ar - rfr) / av;
        /* sharpe ratio formula. */

        /** -----
        @param  : ar - the asset volatility.
                  rfr - the risk free rate.
                  av - the asset volatility.
        @desc   : Return the Sharpe Ratio of an asset.
        @return : returns a number.
        ----- **/
      },

      capm: function (rfr, ab, mr) {
        return rfr + ab * (mr - rfr);
        /* capm formula. */

        /** -----
        @param  : rfr - the risk free rate.
                  ab - the asset beta.
                  mr - the market return.
        @desc   : Return the CAPM of an asset.
        @return : returns a number.
        ----- **/
      },

      expectedValue: function (events, probabilities) {
        var expectedValue = 0;
        /* initialize expectedValue variable. */

        if (events.length === probabilities.length) {
          /* check that events and probabilities arrays are the same length. */
          events.forEach(function (i, o) {
            /* for each event. */
            expectedValue += (i * probabilities[o]);
            /* multiply event by p(event). */
          });
        } else throw "Error. Arrays should be the same length.";

        return expectedValue;
        /* return the expected value. */

        /** -----
        @param  : events - an array of numbers (events).
                  probabilities - an array of probabilities of each event.
        @desc   : Return the expected value.
        @return : returns a number.
        ----- **/
      }

    },

    quant : {
      sum: function (arr) {
        return arr.reduce(function (a, b) {
          return a + b;
        });

        /** -----
        @param  : arr - an array of numbers.
        @desc   : Get the sum of an array.
        @return : returns a number.
        ----- **/
      },

      mean: function (arr) {
        return this.sum(arr) / arr.length;

        /** -----
        @param  : arr - an array of numbers.
        @desc   : Get the mean of an array. Requires internal sum function.
        @return : returns a number.
        ----- **/
      },

      variance: function (arr, sample) {
        var mean = this.mean(arr);
        /* get the mean of the data set. */
        var resids = arr.map(function (i) {
          return Math.pow(i - mean, 2);
          /* for each, get the residual and square it. */
        });

        return this.sum(resids) / (arr.length - !!sample);
        /* return the sum of the residuals over the array length -- minus on
           if it is a sample. */

        /** -----
        @param  : arr - an array of numbers.
                 sample - bool for whether it is sample or not (population).
        @desc   : Get the variance of an array.
        @return : returns a number.
        ----- **/
      },

      last: function (arr) {
        return arr[arr.length - 1];

        /** -----
        @param  : arr - an array of numbers.
        @desc   : Get the last index of an array.
        @return : returns a single index.
        ----- **/
      },

      standardDeviation: function (arr, sample) {
        var variance = this.variance(arr, sample);

        return Math.sqrt(variance);
        /* standard deviation is the square root of the variance. */

        /** -----
        @param  : arr - an array of numbers.
                 sample - bool for whether it is sample or not (population).
        @desc   : Get the standard deviation of an array.
        @return : returns a number.
        ----- **/
      },

      kurtosis: function (arr) {
        var n1 = 1 / arr.length;
        /* first part of the kurtosis equation. */

        var mean = this.mean(arr);

        var n2_top = this.sum(
          arr.map(function (i) {
            return Math.pow(i - mean, 4);
            /* get the residual and take it to the 4th power. */
          })
        );
        /* the top of the second part of the kurtosis equation. */

        var n2_bottom = Math.pow(this.standardDeviation(arr), 4);
        /* the bottom of the second part of the kurtosis equation. */

        return n1 * (n2_top / n2_bottom);
        /* return the equation to show kurtosis. */

        /** -----
        @param  : arr - an array of numbers.
        @desc   : Get the kurtosis of an array.
        @return : returns a number.
        ----- **/
      },

      skewness: function (arr) {
        var length = arr.length;
        var mean = this.mean(arr);

        var top = this.sum(
          arr.map(function (i) {
            return Math.pow(i - mean, 3);
            /* get the residual and take it to the 3rd power. */
          })
        );
        /* this is the top part of the equation. */

        var bottom = (length - 1) * Math.pow(this.standardDeviation(arr, true), 3);
        /* this is the bottom part of the equation. */

        return top / bottom;
        /* return the skewness. */

        /** -----
        @param  : arr - an array of numbers.
        @desc   : Get the skewness of an array.
        @return : returns a number.
        ----- **/
      },

      volatilityFromPrice: function (arr) {
        var residuals = this.residuals(arr).slice(1);
        /* get the residuals array from the price array. */

        var variance = this.variance(residuals, true);

        return Math.sqrt(variance) * Math.sqrt(251);
        /* take the standard deviation and annualize the result. */

        /** -----
        @param  : arr - an array of price values from an asset.
        @desc   : Get the volatility of the total set.
        @return : returns a number.
        ----- **/
      },

      skewnessFromPrice: function (arr) {
        var residuals = this.residuals(arr).slice(1);
        /* get the residuals array from the price array. */

        var skewness = this.skewness(residuals);

        return skewness;
        /* return the skewness value. */

        /** -----
        @param  : arr - an array of price values from an asset.
        @desc   : Get the skewness of the total set.
        @return : returns a number.
        ----- **/
      },

      kurtosisFromPrice: function (arr) {
        var residuals = this.residuals(arr).slice(1);
        /* get the residuals array from the price array. */

        var kurtosis = this.kurtosis(residuals);

        return kurtosis;
        /* return the kurtosis value. */

        /** -----
        @param  : arr - an array of price values from an asset.
        @desc   : Get the kurtosis of the total set.
        @return : returns a number.
        ----- **/
      },

      movingSample: function (arr, period, callback) {
        var slice = arr.slice(0, period);
        /* get the first slice of the array. */

        var newArray = [];
        /* create the array to be returned. */

        for (var x = period; x < arr.length; x++) {
          newArray[x] = callback.call(this, slice, arr[x]);
          /* return a callback with args of this (for use of other funcs),
             the current slice, and the current index. */

          slice.shift();
          /* remove first element (furthest back). */

          slice.push(arr[x]);
          /* add new element to the end. */
        }

        return newArray;
        /* return the custom array. */

        /** -----
        @param  : arr - an array of numbers.
                  period - a period to slice and calculate by.
                  callback - a function for performing math inside and
                  returning a value in.
        @desc   : Perform any continuous period calculation.
        @return : returns an array.
        ----- **/
      },

      productSample: function (arr, callback) {
        var newArray = [];
        /* create the array to be returned. */

        for (var x = 1; x < arr.length; x++) {
          newArray[x] = callback(arr[x], arr[x - 1]);
          /* give a callback with the current and previous index. */
        }

        return newArray;
        /* return the custom array. */

        /** -----
        @param  : arr - an array of numbers.
                  callback - a function for performing math inside and
                  returning a value in.
        @desc   : Perform any continuous product calculation.
        @return : returns an array.
        ----- **/
      },

      bollingerBands: function (arr, period, numDeviations) {
        return this.movingSample(arr, period, function (slice, current) {
          /* utilizes the movingSample property. */

          var tempStdDev = this.standardDeviation(
            this.residuals(slice).filter(function (i) {
              return typeof i == "number";
            }), true) * (numDeviations || 1) + 1,
          /* calculate the standard deviation of the slice. */

          tempMean = this.mean(slice);
          /* calculate the mean of the slice. */

          return {
            high: tempMean * tempStdDev,
            current: current,
            low: tempMean * (1 / tempStdDev)
          };
          /* return rolling mean + 1 stddev, current, and
             rolling mean - 1stddev for each index. */
        });

        /** -----
        @param  : arr - an array of numbers.
                  period - a period to calculate by.
                  numDeviations - the number of standard deviations from mean.
        @desc   : Return an array of bollinger bands.
        @return : Returns an array of objects with the high, current, and low.
        ----- **/
      },

      simpleMovingAverage: function (arr, period) {
        return this.movingSample(arr, period, function (slice) {
          /* utilizes the movingSample property. */

          return this.mean(slice);
          /* return the mean of the trailing period. */
        });

        /** -----
        @param  : arr - an array of numbers.
                  period - a period to calculate by.
        @desc   : Return an array of simple moving average values.
        @return : Returns an array.
        ----- **/
      },

      RSI: function (arr) {
        var counter = 0;

        var residuals = this.residuals(arr).filter(function (i) {
          return typeof i == "number";
        });

        residuals.forEach(function (i) {
          if (i >= 1) counter++;
          /* if the current index is greater than 1, add to counter. */

        });

        return counter / arr.length;
        /* divide by arr.length to get proportion instead of count. */

        /** -----
        @param  : arr - an array of numbers.
        @desc   : Return the simple Relative Strength Index value for an array
                  of daily returns.
        @return : Returns a number.
        ----- **/
      },

      rollingVolatility: function (arr, period) {
        return this.movingSample(arr, period, function (slice) {
          /* utilizes the movingSample property. */

          return this.standardDeviation(slice, true) * 15.84;
          /* return the volatility of the trailing period. */
        });

        /** -----
        @param  : arr - an array of numbers.
                  period - a period to calculate by.
        @desc   : Return an array of volatility values.
        @return : Returns an array.
        ----- **/
      },

      rollingSkewness: function (arr, period) {
        return this.movingSample(arr, period, function (slice) {
          /* utilizes the movingSample property. */

          return this.skewness(slice);
          /* return the skewness over the trailing period. */
        });

        /** -----
        @param  : arr - an array of numbers.
                  period - a period to calculate by.
        @desc   : Return an array of volatility values.
        @return : Returns an array.
        ----- **/
      },

      rollingKurtosis: function (arr, period) {
        return this.movingSample(arr, period, function (slice) {
          /* utilizes the movingSample property. */

          return this.kurtosis(slice);
          /* return the kurtosis over the trailing period. */
        });

        /** -----
        @param  : arr - an array of numbers.
                  period - a period to calculate by.
        @desc   : Return an array of kurtosis values.
        @return : Returns an array.
        ----- **/
      },

      residuals: function (arr) {
        return this.productSample(arr, function (a, b) {
          /* utilizes the productSample property. */

          return a / b;
          /* returns the index over the previous index. */
        });

        /** -----
        @param  : arr - an array of numbers.
        @desc   : Return an array of daily changes.
        @return : Returns an array.
        ----- **/
      },

      summaryStatistics: function (arr) {
        arr = arr.sort(function (a, b) {
          return (a < b) ? -1 : (a > b) ? 1 : 0;
        });

        return {
          min: arr[0],
          max: this.last(arr),
          mean: this.sum(arr) / arr.length,
          q1: arr[Math.floor(arr.length * 0.25)],
          q3: arr[Math.ceil(arr.length * 0.75)]
        };
      },

      gaussian: function () {
        var x1, x2, r;

        do {
          x1 = 2 * Math.random() - 1;
          x2 = 2 * Math.random() - 1;
          r = x1 * x1 + x2 * x2;
        } while (r >= 1 || r === 0);

        return Math.sqrt(-2 * Math.log(r) / r) * x1;

        /** -----
        @desc   : Returns a number with a mean of 0 and stddev of 1.
        @return : Returns a number.
        ----- **/
      },

      normalDist: function (mean, standardDeviation) {
        return mean + this.gaussian() * standardDeviation;

        /** -----
        @param  : mean - the desired mean.
                  standardDeviation - the desired standard deviation.
        @desc   : Return a random number along a distribution with given mean
                  and standard deviation.
        @return : Returns a number.
        ----- **/
      }
    }

  };

  OVERHEAD_FUNCS.build(DOM, outer_prototype);


  return DOM;
})();
