class UserController < ApplicationController
  include HTTParty
  include JSON
  before_filter :setup, :only => [:login, :callback, :get_cals]

  def login
    redirect_uri = @client.authorization.authorization_uri
    redirect_to redirect_uri.to_s
  end

  def callback
    @client.authorization.code = params[:code]
    @client.authorization.fetch_access_token!
    session[:access_token] = @client.authorization.access_token

    get_calendars

    redirect_to home_url
  end

  def setup
    @client = Google::APIClient.new

    # Initialize OAuth 2.0 client    
    @client.authorization.client_id = '532794372708-m1q8o7d4m2dtrpa9muq8k43no0kvdjok.apps.googleusercontent.com'
    @client.authorization.client_secret = 'fja8IGoJr3Bbg-cIp3ZUN9cj'
    @client.authorization.redirect_uri = login_callback_url

    # TODO change this to the calendar scope
    @client.authorization.scope = 'https://www.googleapis.com/auth/calendar'
  end

  def get_cals
    response = HTTParty.get('https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=' + session[:access_token])

    respond_to do |format|
      format.json { render :json => response }
    end
  end
end
