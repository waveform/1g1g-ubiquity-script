// 1g1g mp3 search ubiquity script
var NetErrMsg = "<p style='color:#D22'>连接错误 - 请猛击 <a href='http://www.1g1g.com'>亦歌</a> 选择您钟爱的音乐!</p>";
var BadSeedMsg = "<p style='color:#D22;'>Bad Seed - 错误的种子 </p>";
 
var infoHTML = "<p>亦歌搜索 <strong style='color:#E62'>${query}</strong> ...</p>";
var itemHTML = "<li value='${songIdx}'><a style='text-decoration:none' accessKey='${songIdx}' href='http://www.1g1g.com/${singer}+${name}'>${name} - ${singer} - ${album}</a></li>";
 
var listHTML = "<p style='font-size:small'>Tips:使用组合键 Ctrl+Alt+Num 可快速选择您想听的歌曲</p><p><ol style='line-height:180%'>${items}</ol></p><p style='text-align:right;visibility:${more};'><a style='text-decoration:none;color:#E62;margin-right:40px' href='http://www.1g1g.com/${query}'>More @ 亦歌</a></p>";
 
var cannotFoundHTML = "<p style='font-size:xx-large'>囧rz...</p><p>没能找到有关 <strong style='color:#E62'>${query}</strong> 的歌曲。<a href='http://www.google.com/#hl=en&q=${queryURL}'>Google</a>一下吧</p>";
 
function computeMagic(argument)
{
  var loc5 = 0;
  var loc1 = 17;
  var loc2 = 604373598;
  var loc3 = 0;
  var loc4 = parseInt(argument);
  var loc6 = 0;
  while (loc6 < loc1)
  {
    loc5 = loc4 & 1;
    loc4 = loc4 >> 1 | loc5 << 31;
    loc3 = (loc3 + (loc2 ^ loc4)) & 0xFFFFFFFFF;
    ++loc6;
  }
  /*if(loc3<0)
{
loc3 = -((~loc3 + 1) & 0xFFFFFFFF);
}*/
  return loc3;
}
 
function getSongList(previewBlock, apiParams)
{
  apiParams.uniqueCode = Math.floor(Math.random() * 0x7FFFFFFF);
  CmdUtils.previewAjax(previewBlock, {
    type: "GET",
    url: "http://www.1g1g.com/search/load.jsp",
    dataType: "xml",
    data: apiParams,
    error: function() {
      previewBlock.innerHTML = NetErrMsg;
    },
    success: function(xml) {
      jQuery(xml).find("seed").each(function(){
        previewBlock.innerHTML = BadSeedMsg;
        return;
      });
 
      var songCnt = 0;
      var songItems = "";
      jQuery(xml).find("song").each(function(index){
        songItems += CmdUtils.renderTemplate(itemHTML,
                       {
                         name: $(this).children("name").text(),
                         singer: $(this).children("singer").text(),
                         album: $(this).children("album").text(),
                         songIdx: (index+1) % 10,
                       });
        songCnt = index + 1;
      });
 
      previewBlock.innerHTML =
        CmdUtils.renderTemplate(
          (songCnt == 0) ? cannotFoundHTML : listHTML,
          {
            query : apiParams.query,
            queryURL: encodeURI(apiParams.query),
            items : songItems,
            more : (songCnt==10) ? "none" : "hidden",
          }
        );
    },
  });
}
 
CmdUtils.CreateCommand({
  name: ["1g1g", "mp3"],
  arguments: [{role: "object",
               nountype: noun_arb_text,
               label: "song name"}],
  icon: "http://www.1g1g.com/favicon.ico",
  author: {name: "waveform", email: "wavestyle@gmail.com"},
  homepage: "http://www.crazywithme.com/",
  license: "MPL",
  description: "search and enjoy songs on www.1g1g.com",
  preview: function(previewBlock, arguments) {
    var searchStr = jQuery.trim(arguments.object.text);
    previewBlock.innerHTML = CmdUtils.renderTemplate(
                               infoHTML,
                               {query : searchStr}
                             );
    if(searchStr.length < 1) {
      return;
    }
    
    var apiParams = {
      number : "10",
      start : "0",
      type : "search",
      uniqueCode : Math.floor(Math.random() * 0x7FFFFFFF),
      encoding : "utf8",
      query : searchStr,
      magic : Math.floor(Math.random() * 0x7FFFFFFF),
    };
    
    CmdUtils.previewAjax(previewBlock, {
      type: "GET",
      url: "http://www.1g1g.com/search/load.jsp",
      dataType: "xml",
      data: apiParams,
      error: function() {
     previewBlock.innerHTML = NetErrMsg;
      },
      success: function(xml) {
        jQuery(xml).find("seed").each(function(){
          apiParams.magic = computeMagic($(this).text());
          // Utils.log($(this).text(), " --> ", apiParams.magic);
        });
 
        getSongList(previewBlock, apiParams);
      },
    });
  },
  execute: function(arguments) {
    var searchUrl = "http://www.1g1g.com/" + encodeURI(arguments.object.text);
    Utils.openUrlInBrowser(searchUrl);
  },
});
