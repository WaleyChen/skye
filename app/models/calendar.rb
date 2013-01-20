class Calendar
  include Mongoid::Document

  field :api_id
  field :email
  field :events

  belongs_to :user
end