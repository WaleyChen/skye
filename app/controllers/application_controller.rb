class ApplicationController < ActionController::Base
  protect_from_forgery

  def access_token_expired?
    session[:access_token].nil? || session[:issued_at] && session[:expires_in] && session[:issued_at]  + session[:expires_in] * 1.seconds < Time.now
  end
end
