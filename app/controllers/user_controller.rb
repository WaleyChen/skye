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
    if access_token_expired?
      flash[:notice] = 'Token Expired'
      redirect_to home_url
    end
  end

  # $.get('get_tasks?cal_id=waleycz@gmail.com', function(data) {
  #   console.log(data);
  #  });
  def get_tasks
    email = params[:email]
    json = Task.where(:email => email).all.to_json

    respond_to do |format|
      format.json { render :json => json }
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
      c.api_id = cal_id
      c.events = response
      c.email = u.email
      c.user = u
      c.save
    end

    @response
  end

  def set_tasks_from_events
    cals = Calendar.where(:email => session[:email])

    cals.each do |cal|
      cal.events["items"].each do |event|
        rec = event["recurrence"]
        
        if rec.nil?
          create_task_from_event(event, nil)
        else
          @response = HTTParty.get("https://www.googleapis.com/calendar/v3/calendars/#{ cal.api_id }/events/#{ event['id'] }/instances?access_token=#{ session[:access_token] }")
          
          head_id = @response["items"].first["id"]

          @response["items"].each_with_index do |event, index|
            break if index > 20
            create_task_from_event(event, head_id)
          end
        end

      end
    end
  end

  def create_task_from_event(event, head_id)
    t = Task.new
    t.name = event["summary"]
    t.email = session[:email]

    return false if event["start"].nil?
    date_type = event["start"]["date"].nil? ? 'dateTime' : 'date'

    t.start_after = Time.parse(event["start"][date_type]).to_i 
    t.end_before = Time.parse(event["end"][date_type]).to_i
    t.event_id = event['id']
    t.head_id = head_id

    t.duration = t.end_before - t.start_after
    t.save
  end

  def logout
    @response = HTTParty.get("https://accounts.google.com/o/oauth2/revoke?token=#{ session[:access_token] }")
    puts @response

    session.delete(:access_token)

    redirect_to home_url
  end
end
