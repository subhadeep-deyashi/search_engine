/*******************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 ******************************************************************************/

var win = this;

/*
 * This function does the actual highlighting.  It does the highlighting by 
 * wrapping the found terms in a span tag with the class searchterm.  You
 * can specify whatever highlighting style you want for this class.  
 */
function doSearchHighlight(bodyText, searchTerm) 
{
   highlightStartTag = "<span class=\"searchterm\">";
   highlightEndTag = "</span>";

   /*
    * We want to find all of the terms, but we don't want to find them
    * inside of HTML tags.  We can't really do a perfect parse of the
    * HTML so we just do the best we can to avoid the inside of tags and
    * everything between the <script> and the </script> tags.
    */
   var newText = "";
   var i = -1;
   var lSearchTerm = searchTerm.toLowerCase();
   var lBodyText = bodyText.toLowerCase();
   
   while (bodyText.length > 0) {
      i = lBodyText.indexOf(lSearchTerm, i+1);
      if (i < 0) {
         newText += bodyText;
         bodyText = "";
      } else {
         // skip anything inside an HTML tag
         if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
            // skip anything inside a <script> block
            if (lBodyText.lastIndexOf("/script>", i) >= lBodyText.lastIndexOf("<script", i)) {
               newText += bodyText.substring(0, i) + highlightStartTag + bodyText.substr(i, searchTerm.length) + highlightEndTag;
               bodyText = bodyText.substr(i + searchTerm.length);
               lBodyText = bodyText.toLowerCase();
               i = -1;
            }
         }
      }
   }
   
   return newText;
}


/*
 * This function will parse the search terms and call the doSearchHighlight method
 * to highlight the text.
 */
function highlightSearchTerms(searchText)
{
   searchArray = new Array();

   var inquote = false;
   var buf = "";
   for (i = 0; i < searchText.length; i++) {
      
      var c = searchText.charAt(i);
      
      switch (c) {
      case "'":
         if (inquote) {
            searchArray.push(buf);
            buf = "";
            inquote = false;
         } else {
            inquote = true;
         }
         
         break;
      case " ":
         if (!inquote) {
            if (buf.length > 0) {
               searchArray.push(buf);
            }
            buf = "";
            break;
         }
      default:
         buf = buf + c;
      }
   }
   if (buf.length > 0) {
      searchArray.push(buf);
   }


   if (!document.body || typeof(document.body.innerHTML) == "undefined") {
      return false;
   }

   var bodyText = document.body.innerHTML;
   
   for (var i = 0; i < searchArray.length; i++) {
      bodyText = doSearchHighlight(bodyText, searchArray[i]);
   }
   
   document.body.innerHTML = bodyText;
   return true;
}


/*
 * This function does the actual search
 */
function doSearch()
{
   searchText = getURLParam("term");
   
   if (!searchText) {
      // If there was nothing to search for we want to return
      // quickly.
      return false;
   }

   while (searchText.indexOf("%20") != -1) {
      searchText = searchText.replace("%20", " ");
   }

   while (searchText.indexOf("%22") != -1) {
      searchText = searchText.replace("%22", "'");
   }
   
   return highlightSearchTerms(searchText);
}


function getURLParam(strParamName)
{
   var strReturn = "";
   var strHref = window.location.href;
   if ( strHref.indexOf("&") > -1 ) {
      var strQueryString = strHref.substr(strHref.indexOf("&")).toLowerCase();
      var aQueryString = strQueryString.split("&");
      for ( var iParam = 0; iParam < aQueryString.length; iParam++ ) {
         if ( aQueryString[iParam].indexOf(strParamName + "=") > -1 ) {
            var aParam = aQueryString[iParam].split("=");
            strReturn = aParam[1];
            break;
         }
      }
   }
   return strReturn;
}

