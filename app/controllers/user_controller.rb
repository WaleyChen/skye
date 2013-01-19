class UserController < ApplicationController
  include HTTParty
  include JSON
  # include RiCal

  before_filter :setup, :only => [:login, :callback, :get_cals]
  before_filter :refresh_token, :except => [:login, :callback]

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

    email = HTTParty.get("https://www.googleapis.com/userinfo/email?alt=json&access_token=#{ session[:access_token] }").parsed_response["data"]["email"]

    User.where(:email => email).all.destroy
    Calendar.where(:email => email).all.destroy
    Task.where(:email => email).all.destroy
    u = User.new
    u.name = email
    u.email = email
    u.save

    session[:email] = email

    get_cals_json
    get_events_json
    set_tasks_from_events

    redirect_to(schedule_url)
  end

  def setup
    @client = Google::APIClient.new

    # Initialize OAuth 2.0 client    
    @client.authorization.client_id = '532794372708-m1q8o7d4m2dtrpa9muq8k43no0kvdjok.apps.googleusercontent.com'
    @client.authorization.client_secret = 'fja8IGoJr3Bbg-cIp3ZUN9cj'
    @client.authorization.redirect_uri = login_callback_url

    # TODO change this to the calendar scope
    @client.authorization.scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar'
  end

  def refresh_token
    puts session[:access_token]

    if access_token_expired?
      flash[:notice] = 'Token Expired'
      redirect_to home_url
    end
  end

  # $.get('get_cals', function(data) {
  #   console.log(data);
  # });
  def get_cals
    response = get_cals_json

    respond_to do |format|
      format.json { render :json => response }
    end
  end

  def get_cals_json
    session[:cal_ids] = []
    @response = HTTParty.get("https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=#{ session[:access_token] }")

    @response['items'].each do |cal| 
      session[:cal_ids] << cal['id'] if cal['accessRole'] == "owner"
    end
  end

  # $.get('get_events?cal_id=waleycz@gmail.com', function(data) {
  #   console.log(data);
  #  });
  def get_events
    @response = get_events_json

    respond_to do |format|
      format.json { render :json => @response }
    end
  end

  def get_events_json
    @response = []
    max_results = 100
    # 2012-07-12T09:30:00.0z
    u = User.where(:email => session[:email]).first
    t = Time.now.strftime("%Y-%m-%d") + "T00:00:00Z"

    session[:cal_ids].each do |cal_id|
      c = Calendar.new
      response = HTTParty.get("https://www.googleapis.com/calendar/v3/calendars/#{ cal_id }/events?access_token=#{ session[:access_token] }&maxResults=#{ max_results }&timeMin=#{ t }")
      @response << response
      c.events = response
      c.email = u.email
      c.user = u
      c.save
    end

    @response
  end

  def set_tasks_from_events
    # cals = Calendar.where(:email => session[:email])

    # cals.each do |cal|
    #   cal.events["items"].each do |event|

    #     rec = event["recurrence"]

    #     if rec.present?
    #       puts rec.split(",")

    #       rec_freq = rec[0]

    #       if rec_freq.include?("DAILY")
    #         rec_freq = 1.day
    #       elsif rec_freq.include?("WEEKLY")
    #         rec_freq = 1.week
    #       elsif rec_freq.include?("MONTHLY")
    #         rec_freq = 1.month
    #       else
    #         rec_freq = 1.year
    #       end

    #       break if rec_freq.size == 1
    #     end

    #     t = Task.new
    #     t.name = event["summary"]
    #     t.email = session[:email]

    #     date_type = event["start"]["date"].nil? ? 'dateTime' : 'date'

    #     t.start_after = Time.parse(event["start"][date_type]).to_i 
    #     t.end_before = Time.parse(event["end"][date_type]).to_i

    #     t.duration = t.start_after - t.end_before
    #     t.save
    #   end
    # end
  end

  def logout
    @response = HTTParty.get("https://accounts.google.com/o/oauth2/revoke?token=#{ session[:access_token] }")
    puts @response

    session.delete(:access_token)

    redirect_to home_url
  end
end
