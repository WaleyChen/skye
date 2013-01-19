class UserController < ApplicationController
  before_filter :setup, :only => [:login, :callback]

  def login
    redirect_uri = @client.authorization.authorization_uri
    redirect_to redirect_uri.to_s
  end

  def callback
    @client.authorization.code = params[:code]
    @client.authorization.fetch_access_token!

    redirect_to(home_url)
  end

  def setup
    @client = Google::APIClient.new
    @plus = @client.discovered_api('plus')

    # Initialize OAuth 2.0 client    
    @client.authorization.client_id = '532794372708-m1q8o7d4m2dtrpa9muq8k43no0kvdjok.apps.googleusercontent.com'
    @client.authorization.client_secret = 'fja8IGoJr3Bbg-cIp3ZUN9cj'
    @client.authorization.redirect_uri = login_callback_url

    # TODO change this to the calendar scope
    @client.authorization.scope = 'https://www.googleapis.com/auth/plus.me'
  end
end
