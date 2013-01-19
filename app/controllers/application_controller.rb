class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :set_client, :only => [:log_in, :auth]

  def home

  end

  def log_in
    # Request authorization
    redirect_uri = @client.authorization.authorization_uri
    redirect_to redirect_uri.to_s
  end

  def auth
    @client.authorization.code = params[:code]
    @client.authorization.fetch_access_token!

    # Make an API call
    result = @client.execute(
      :api_method => @plus.activities.list,
      :parameters => {'collection' => 'public', 'userId' => 'me'}
    )

    puts result.data
  end

  def set_client
    @client = Google::APIClient.new
    @plus = @client.discovered_api('plus')

    # Initialize OAuth 2.0 client    
    @client.authorization.client_id = '532794372708-m1q8o7d4m2dtrpa9muq8k43no0kvdjok.apps.googleusercontent.com'
    @client.authorization.client_secret = 'fja8IGoJr3Bbg-cIp3ZUN9cj'
    @client.authorization.redirect_uri = auth_url

    @client.authorization.scope = 'https://www.googleapis.com/auth/plus.me'
  end
end
