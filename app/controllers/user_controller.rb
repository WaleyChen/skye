class UserController < ApplicationController
  include HTTParty
  include JSON
  include URI
  before_filter :setup, :only => [:login, :callback, :get_cals]
  before_filter :refresh_token

  def login
    redirect_uri = @client.authorization.authorization_uri
    redirect_to redirect_uri.to_s
  end

  def callback
    session[:google_token] = params[:code]
    @client.authorization.code = params[:code]
    @client.authorization.fetch_access_token!
    session[:access_token] = @client.authorization.access_token
    session[:refresh_token] = @client.authorization.refresh_token
    session[:expires_in] = @client.authorization.expires_in
    session[:issued_at] = @client.authorization.issued_at
    redirect_to(schedule_url)
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

  def refresh_token
    if session[:access_token] && session[:issued_at] + session[:expires_in] * 1.seconds < Time.now
      redirect_to :action => 'login'
    end
  end

  # $.get('get_cals', function(data) {
  #   console.log(data);
  # });
  def get_cals
    session[:cal_ids] = []
    response = HTTParty.get("https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=#{ session[:access_token] }")

    response['items'].each do |cal| 
      session[:cal_ids] << cal['id']
    end

    respond_to do |format|
      format.json { render :json => response }
    end
  end

  # $.get('get_events?cal_id=oind4tiuh8mitd3q30blhpdl9o@group.calendar.google.com', function(data) {
  #   console.log(data);
  # });
  def get_events
    cal_id = params[:cal_id]
    max_results = 100
    t = URI.escape(Time.now.to_s)
    puts t
    response = HTTParty.get("https://www.googleapis.com/calendar/v3/calendars/#{ cal_id }/events?access_token=#{ session[:access_token] }&maxResults=#{ max_results }&timeMin=#{ t }")

    respond_to do |format|
      format.json { render :json => response }
    end
  end
end
