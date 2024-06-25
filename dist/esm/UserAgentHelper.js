function isMobile(ua) {
    try {
        let userAgent = ua || '';
        // noinspection RegExpRedundantEscape,RegExpSingleCharAlternation
        return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4)));
    }
    catch (ex) {
        return false;
    }
}
function browserType(userAgent) {
    userAgent = userAgent.toLowerCase();
    let result = 'Unknown';
    const browserArray = {
        'IE': userAgent.includes('msie') || userAgent.includes('trident'),
        'Chrome': userAgent.indexOf('chrome') > -1 && userAgent.indexOf('safari') > -1,
        'Firefox': userAgent.indexOf('firefox') > -1,
        'Opera': userAgent.indexOf('opera') > -1,
        'Safari': userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') == -1,
        'Edge': userAgent.indexOf('edge') > -1 || userAgent.indexOf('edg/') > -1,
        'QQBrowser': /qqbrowser/.test(userAgent),
        'WeixinBrowser': /MicroMessenger/i.test(userAgent), // wechat browser
    };
    for (const i in browserArray) {
        if (browserArray[i]) {
            result = i;
        }
    }
    return result;
}
function chromeMajorVersion(userAgent) {
    const chromeVersionPart = userAgent.match(/[Chrome|CriOS]\/(.*?)\./);
    if (chromeVersionPart) {
        return parseInt(chromeVersionPart[1]);
    }
    return null;
}
function chromeVersion(userAgent) {
    const chromeVersionPart = userAgent.match(/[Chrome|CriOS]\/(.*?) /);
    if (chromeVersionPart) {
        return chromeVersionPart[1];
    }
    return null;
}
function os(userAgent) {
    // https://wicg.github.io/ua-client-hints/#sec-ch-ua-platform
    let result = 'Unknown';
    const OSArray = {
        'Windows': false,
        'macOS': false,
        'Linux': false,
        'iPhone': false,
        'iPod': false,
        'iPad': false,
        'Android': false,
    };
    userAgent = userAgent.toLowerCase();
    OSArray['Windows'] = userAgent.includes('win32') || userAgent.includes('win64') || userAgent.includes('windows');
    OSArray['macOS'] = userAgent.includes('macintosh') || userAgent.includes('mac68k') || userAgent.includes('macppc') || userAgent.includes('macintosh');
    OSArray['Linux'] = userAgent.includes('linux');
    OSArray['iPhone'] = userAgent.includes('iphone');
    OSArray['iPod'] = userAgent.includes('ipod');
    OSArray['iPad'] = userAgent.includes('ipad');
    OSArray['Android'] = userAgent.includes('android');
    for (const i in OSArray) {
        if (OSArray[i]) {
            result = i;
        }
    }
    return result;
}
export const UserAgentHelper = {
    isMobile,
    browserType,
    chromeMajorVersion,
    chromeVersion,
    os,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlckFnZW50SGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvVXNlckFnZW50SGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsUUFBUSxDQUFDLEVBQVU7SUFDeEIsSUFBSTtRQUNBLElBQUksU0FBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUE7UUFDeEIsaUVBQWlFO1FBQ2pFLE9BQU8sQ0FBQyxxVkFBcVYsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3pXLHlrREFBeWtELENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUM5bUQ7SUFBQyxPQUFPLEVBQU8sRUFBRTtRQUNkLE9BQU8sS0FBSyxDQUFBO0tBQ2Y7QUFDTCxDQUFDO0FBYUQsU0FBUyxXQUFXLENBQUMsU0FBaUI7SUFDbEMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUVuQyxJQUFJLE1BQU0sR0FBaUIsU0FBUyxDQUFBO0lBQ3BDLE1BQU0sWUFBWSxHQUErQjtRQUM3QyxJQUFJLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUNqRSxRQUFRLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5RSxTQUFTLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLFFBQVEsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENB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