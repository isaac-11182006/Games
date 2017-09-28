package com.ivant.spyfall.enums;

/**
 * @author Isaac Arenas Pichay
 * @since Sep 28, 2017
 */

public enum Emoji {
	GUN("-gun", "<i class=\"em em-gun\"/><audio src=\"../sounds/gunshot.mp3\" autoplay=\"true\" />");

	public String code;
	public String htmlCode;

	private Emoji(String code, String htmlCode) {
		this.code = code;
		this.htmlCode = htmlCode;
	}

	public String getCode() {
		return code;
	}

	public String getHtmlCode() {
		return htmlCode;
	}
	
	public static Emoji getByCode(String code){
		for(Emoji emojis : values()){
			if(emojis.code.equals(code)){
				return emojis;
			}
		}
		return null;
	}

}
